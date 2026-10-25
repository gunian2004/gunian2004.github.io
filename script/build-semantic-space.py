#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建「语义空间」页面所需的数据。

流程：pages/AI.html 知识卡 -> 语义切块 -> 中文二字切分 -> TF-IDF
      -> 余弦矩阵 -> 特征分解（LSA）-> 3 维坐标 -> data/semantic-space/space.json

只依赖 Python 标准库，可离线重跑：
    python script/build-semantic-space.py

换神经 embedding 时只需替换 vectorize() 里的 tfidf 部分，
后面的相似度、降维、输出结构都不用动。
"""

import html
import json
import math
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "pages", "AI.html")
OUT_DIR = os.path.join(ROOT, "data", "semantic-space")
OUT = os.path.join(OUT_DIR, "space.json")

CATEGORY_CN = {
    "prompts": "提示词",
    "rules": "代理规则",
    "design": "软件设计",
    "agent": "智能体开发",
    "automation": "自动化工作流",
    "product": "产品分析",
    "project": "项目实践",
}

# 12 个预设问题：离线算好向量与排名，浏览器直接读
PRESET_QUERIES = [
    ("怎么让 AI 不要擅自改我的代码？", "授权与边界"),
    ("任务开始前应该问清楚哪些信息？", "需求澄清"),
    ("怎么把重复的流程交给自动化？", "流程自动化"),
    ("对话多了就忘记上下文怎么办？", "记忆与上下文"),
    ("代码写完以后先做什么检查？", "交付验证"),
    ("怎么保证每一步都不糊弄？", "质量红线"),
    ("本地和服务器上的代码怎么同步？", "版本管理"),
    ("怎么用浏览器调试端口接上代理？", "调试环境"),
    ("做竞品分析可以用什么方法？", "产品分析"),
    ("微服务和单体架构怎么选？", "架构决策"),
    ("任务卡住了应该怎么汇报？", "异常上报"),
    ("怎么让模型输出更符合预期？", "提示词约束"),
]


# ---------- 1. 解析知识卡 ----------

CARD_RE = re.compile(
    r'<article class="knowledge-card"[^>]*data-category="([^"]+)"[^>]*>(.*?)</article>',
    re.S,
)
H3_RE = re.compile(r"<h3>(.*?)</h3>", re.S)
BODY_RE = re.compile(r'<div class="knowledge-body">(.*?)</div>', re.S)


def strip_tags(fragment):
    text = fragment
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<li[^>]*>", "\n• ", text, flags=re.I)
    text = re.sub(r"</(p|li|ul|ol|div|h\d)>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)
    text = text.replace("\u00a0", " ").replace("\u3000", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n", text)
    return text.strip()


def parse_cards(path):
    with open(path, "r", encoding="utf-8") as fh:
        page = fh.read()

    docs = []
    for category, inner in CARD_RE.findall(page):
        title_m = H3_RE.search(inner)
        body_m = BODY_RE.search(inner)
        if not title_m or not body_m:
            continue
        title = strip_tags(title_m.group(1)).replace("\n", " ").strip()
        body = strip_tags(body_m.group(1))
        if not body:
            continue
        docs.append({"title": title, "category": category, "body": body})
    return docs


def parse_projects(path):
    """首页 6 个项目卡：描述 + 要点 + 问题/做法/结果，算作「项目实践」语料。"""
    with open(path, "r", encoding="utf-8") as fh:
        page = fh.read()

    start = page.find('<section class="section" id="projects"')
    end = page.find('<section class="section practice-section"', start)
    if start < 0 or end < 0:
        return []
    block = page[start:end]

    docs = []
    for seg in block.split('<div class="project-card')[1:]:
        title_m = re.search(r'<h3 class="project-title">(.*?)</h3>', seg, re.S)
        if not title_m:
            continue
        title = strip_tags(title_m.group(1)).strip()
        parts = []
        desc_m = re.search(r'<p class="project-desc">(.*?)</p>', seg, re.S)
        if desc_m:
            parts.append(strip_tags(desc_m.group(1)))
        for step in re.findall(
            r'<span class="project-case-label">(.*?)</span>\s*<p>(.*?)</p>', seg, re.S
        ):
            label = strip_tags(step[0]).strip()
            parts.append(f"{label}：{strip_tags(step[1])}")
        for li in re.findall(r'<li>(.*?)</li>', seg, re.S):
            text = strip_tags(li)
            if 12 <= len(text) <= 220:
                parts.append(text)
        body = "\n".join(p for p in parts if p)
        if len(body) > 20:
            docs.append({"title": title, "category": "project", "body": body})
    return docs


# ---------- 2. 切块 ----------

SENT_SPLIT = re.compile(r"(?<=[。；！？!?;])\s*")


def split_long(line, limit=150):
    """把超长段落按句号切开，尽量每块不超过 limit 字。"""
    if len(line) <= limit * 1.5:
        return [line]
    out, buf = [], ""
    for sent in SENT_SPLIT.split(line):
        if not sent:
            continue
        if len(buf) + len(sent) <= limit:
            buf += sent
        else:
            if buf:
                out.append(buf)
            buf = sent
            while len(buf) > limit * 2:  # 单句超长，硬切
                out.append(buf[:limit])
                buf = buf[limit:]
    if buf:
        out.append(buf)
    return out


def chunk_doc(doc, min_len=14, target=110, hard_max=260):
    lines = [ln.strip() for ln in doc["body"].split("\n") if ln.strip()]
    pieces = []
    for ln in lines:
        pieces.extend(split_long(ln))

    chunks, buf = [], ""
    for piece in pieces:
        if not buf:
            buf = piece
            continue
        if len(buf) < target and len(buf) + len(piece) <= hard_max:
            buf = buf + "\n" + piece
        else:
            if len(buf) >= min_len:
                chunks.append(buf)
            buf = piece
    if len(buf) >= min_len:
        chunks.append(buf)
    return [c.strip() for c in chunks if len(c.strip()) >= min_len]


# ---------- 3. 向量化 ----------

CJK = re.compile(r"[\u4e00-\u9fff]")
ASCII_WORD = re.compile(r"[a-z0-9][a-z0-9+#._\-]*")


def tokenize(text):
    text = text.lower()
    tokens = []
    for run in re.findall(r"[\u4e00-\u9fff]+", text):
        if len(run) == 1:
            tokens.append(run)
        else:
            for i in range(len(run) - 1):
                tokens.append(run[i : i + 2])
    for word in ASCII_WORD.findall(text):
        if len(word) >= 2:
            tokens.append(word)
    return tokens


def build_tfidf(corpus_tokens):
    """返回 (idf, doc_vectors) —— tf 用 1+log，行向量做 L2 归一化。"""
    n = len(corpus_tokens)
    df = {}
    for tokens in corpus_tokens:
        for term in set(tokens):
            df[term] = df.get(term, 0) + 1
    idf = {t: math.log((1.0 + n) / (1.0 + d)) + 1.0 for t, d in df.items()}

    vectors = []
    for tokens in corpus_tokens:
        tf = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        vec = {}
        for t, c in tf.items():
            vec[t] = (1.0 + math.log(c)) * idf.get(t, 1.0)
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        vectors.append({t: v / norm for t, v in vec.items()})
    return idf, vectors


def cosine_sparse(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(t, 0.0) for t, v in a.items())


# ---------- 4. 降维（LSA：余弦矩阵的特征分解） ----------

def mat_vec(mat, vec):
    return [sum(row[j] * vec[j] for j in range(len(vec))) for row in mat]


def top_eigen(mat, k=3, iters=260):
    """对称半正定矩阵的前 k 个特征对（幂迭代 + 收缩）。"""
    n = len(mat)
    a = [row[:] for row in mat]
    pairs = []
    for c in range(k):
        v = [1.0 + 0.001 * ((i * 7 + c * 13) % 11) for i in range(n)]
        norm = math.sqrt(sum(x * x for x in v)) or 1.0
        v = [x / norm for x in v]
        for _ in range(iters):
            w = mat_vec(a, v)
            nw = math.sqrt(sum(x * x for x in w))
            if nw < 1e-12:
                break
            w = [x / nw for x in w]
            delta = sum(abs(w[i] - v[i]) for i in range(n))
            v = w
            if delta < 1e-9:
                break
        lam = sum(v[i] * mat_vec(a, v)[i] for i in range(n))
        pairs.append((lam, v))
        for i in range(n):
            for j in range(n):
                a[i][j] -= lam * v[i] * v[j]
    return pairs


def layout(sim, mode="whiten"):
    """sim: 余弦相似度矩阵。返回 (coords, eigenvalues)。"""
    pairs = top_eigen(sim, 3)
    n = len(sim)
    coords = []
    for i in range(n):
        p = []
        for lam, v in pairs:
            if mode == "whiten":
                p.append(v[i])
            else:
                p.append(v[i] * math.sqrt(max(lam, 0.0)))
        coords.append(p)
    return coords, [lam for lam, _ in pairs]


def normalize_coords(coords, span=1.0):
    """按 2%–98% 分位裁尾、用均值居中，再让 98% 的点落在 ±span 内。"""
    n = len(coords)
    out = [[0.0, 0.0, 0.0] for _ in range(n)]
    for axis in range(3):
        vals = sorted(c[axis] for c in coords)
        lo = vals[int(n * 0.02)]
        hi = vals[min(n - 1, int(n * 0.98))]
        clipped = [max(lo, min(hi, c[axis])) for c in coords]
        mean = sum(clipped) / n
        devs = sorted(abs(v - mean) for v in clipped)
        p98 = devs[min(n - 1, int(n * 0.98))] or 1e-9
        k = span / p98
        for i, v in enumerate(clipped):
            out[i][axis] = max(-1.25 * span, min(1.25 * span, (v - mean) * k))
    return out


def separation(coords, labels):
    """同主题 3D 距离 比 跨主题 距离 小多少（越大越好）。"""
    same, diff = [], []
    n = len(coords)
    for i in range(n):
        for j in range(i + 1, n):
            d = math.dist(coords[i], coords[j])
            (same if labels[i] == labels[j] else diff).append(d)
    if not same or not diff:
        return 0.0
    return (sum(diff) / len(diff)) / (sum(same) / len(same))


# ---------- 5. 主流程 ----------

def main():
    docs = parse_cards(SRC) + parse_projects(os.path.join(ROOT, "index.html"))
    if not docs:
        sys.exit("没有解析到语料，先检查 pages/AI.html 的 .knowledge-card 结构")

    chunks = []
    for di, doc in enumerate(docs):
        for ci, text in enumerate(chunk_doc(doc)):
            chunks.append(
                {
                    "d": di,
                    "t": doc["title"],
                    "c": doc["category"],
                    "s": ci,
                    "x": text,
                    "n": len(re.sub(r"\s", "", text)),
                }
            )

    tokens = [tokenize(c["x"]) + tokenize(c["t"]) * 2 for c in chunks]
    idf, vectors = build_tfidf(tokens)
    n = len(chunks)

    sim = [[0.0] * n for _ in range(n)]
    for i in range(n):
        sim[i][i] = 1.0
        for j in range(i + 1, n):
            s = cosine_sparse(vectors[i], vectors[j])
            sim[i][j] = s
            sim[j][i] = s

    labels = [c["c"] for c in chunks]
    best = None
    for mode in ("whiten", "scaled"):
        coords, eigs = layout(sim, mode)
        spread = separation(coords, labels)
        print(f"  布局 {mode}: 主题分离度 {spread:.3f}  特征值 {['%.3f' % e for e in eigs]}")
        if best is None or spread > best[0]:
            best = (spread, mode, coords)
    _, mode, coords = best
    coords = normalize_coords(coords, 1.0)

    # 半径档位：按字数三分位
    lengths = sorted(c["n"] for c in chunks)
    q1, q2 = lengths[n // 3], lengths[2 * n // 3]
    for c, p in zip(chunks, coords):
        c["p"] = [round(v, 4) for v in p]
        c["k"] = 1 if c["n"] <= q1 else (2 if c["n"] <= q2 else 3)

    # 预设问题：离线算排名与落点
    queries = []
    for text, hint in PRESET_QUERIES:
        qt = tokenize(text)
        tf = {}
        for t in qt:
            tf[t] = tf.get(t, 0) + 1
        qvec = {}
        for t, cnt in tf.items():
            if t in idf:
                qvec[t] = (1.0 + math.log(cnt)) * idf[t]
        norm = math.sqrt(sum(v * v for v in qvec.values())) or 1.0
        qvec = {t: v / norm for t, v in qvec.items()}

        scored = sorted(
            ((cosine_sparse(qvec, vectors[i]), i) for i in range(n)), reverse=True
        )
        top = scored[:24]
        hits = [[i, round(s, 4)] for s, i in top if s > 0.02]
        heavy = hits[:8]
        wsum = sum(w for _, w in [(i, s * s) for i, s in heavy]) or 1.0
        qp = [0.0, 0.0, 0.0]
        for i, s in heavy:
            for axis in range(3):
                qp[axis] += chunks[i]["p"][axis] * (s * s) / wsum
        queries.append(
            {
                "q": text,
                "hint": hint,
                "hits": hits,
                "p": [round(v, 4) for v in qp],
                "terms": [t for t in qvec if len(t) > 1][:8],
            }
        )
        sample = " / ".join(chunks[i]["t"] for i, _ in hits[:3])
        print(f"  「{text}」 → {sample}")

    payload = {
        "meta": {
            "generated": "2026-10-25",
            "source": "pages/AI.html",
            "method": "TF-IDF(中文二字切分) → 余弦 → 特征分解 3 维（LSA）",
            "docs": len(docs),
            "chunks": n,
            "vocab": len(idf),
            "layout": mode,
        },
        "docs": [
            {
                "id": i,
                "title": d["title"],
                "category": d["category"],
                "label": CATEGORY_CN.get(d["category"], d["category"]),
            }
            for i, d in enumerate(docs)
        ],
        "chunks": [
            {
                "i": i,
                "d": c["d"],
                "t": c["t"],
                "c": c["c"],
                "n": c["n"],
                "k": c["k"],
                "x": c["x"],
                "p": c["p"],
            }
            for i, c in enumerate(chunks)
        ],
        "queries": queries,
        "categories": [
            {"key": k, "label": v} for k, v in CATEGORY_CN.items()
        ],
    }
    payload["meta"].pop("eigen", None)
    payload["meta"]["layoutScore"] = round(best[0], 3)

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))

    # 同时产出一份 JS：用 <script> 引入，file:// 直开也不会被 CORS 挡
    out_js = os.path.join(OUT_DIR, "space.js")
    with open(out_js, "w", encoding="utf-8") as fh:
        fh.write("// 由 script/build-semantic-space.py 生成，请勿手改。\n")
        fh.write("window.SS_DATA=")
        json.dump(payload, fh, ensure_ascii=False, separators=(",", ":"))
        fh.write(";\n")

    size = os.path.getsize(OUT) / 1024.0
    print(
        f"\n✓ {len(docs)} 张卡 → {n} 个片段，词表 {len(idf)}，"
        f"布局 {mode}，输出 {size:.0f} KB → {os.path.relpath(OUT, ROOT)}"
    )


if __name__ == "__main__":
    main()
