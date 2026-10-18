(() => {
 'use strict';
 const cards=[...document.querySelectorAll('article.card[id]')];
 const bar=document.querySelector('.bar');
 if(!bar||!cards.length)return;
 const ids=new Set(cards.map(card=>card.id));
 function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch(_){return fallback;}}
 const stored=read('hltb:bookmarks',[]);
 const bookmarks=new Set(Array.isArray(stored)?stored.filter(id=>ids.has(id)):[]);
 let saved=read('hltb:position',null);
 if(!saved||!ids.has(saved.id))saved=null;
 let onlyBookmarks=false, current=null, saveTimer=0, frame=0;
 const tools=document.createElement('div');tools.className='reader-tools';
 tools.innerHTML='<div class="reader-progress"><span id="readerPosition">阅读位置 0 / '+cards.length+'</span><div class="reader-track" role="progressbar" aria-label="阅读位置" aria-valuemin="0" aria-valuemax="'+cards.length+'" aria-valuenow="0"><div class="reader-fill"></div></div></div><button class="btn" id="readerResume" type="button" hidden>继续上次阅读</button><button class="btn" id="readerFavorites" type="button" aria-pressed="false">我的收藏（0）</button><span class="reader-notice" role="status" aria-live="polite"></span>';
 bar.append(tools);
 const notice=tools.querySelector('.reader-notice');
 function store(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){notice.textContent='当前浏览器无法保存阅读记录';return false;}}
 const favorites=tools.querySelector('#readerFavorites');
 const resume=tools.querySelector('#readerResume');
 function updateResume(){
  resume.hidden=!saved;
  if(saved){const card=document.getElementById(saved.id);resume.textContent='继续上次阅读';resume.title=card.querySelector('h3').textContent;}
 }
 function updateFavorites(){favorites.textContent='我的收藏（'+bookmarks.size+'）';favorites.setAttribute('aria-pressed',String(onlyBookmarks));}
 cards.forEach(card=>{
  const button=document.createElement('button');button.type='button';button.className='reader-bookmark';
  function render(){const on=bookmarks.has(card.id);button.textContent=on?'★ 已收藏':'☆ 收藏';button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',(on?'取消收藏：':'收藏：')+card.querySelector('h3').textContent);}
  render();card.querySelector('.chead').append(button);
  button.addEventListener('click',()=>{if(bookmarks.has(card.id))bookmarks.delete(card.id);else bookmarks.add(card.id);render();updateFavorites();store('hltb:bookmarks',[...bookmarks]);if(onlyBookmarks)window.apply();});
 });
 window.LifeReading={includes:id=>!onlyBookmarks||bookmarks.has(id)};
 favorites.addEventListener('click',()=>{onlyBookmarks=!onlyBookmarks;updateFavorites();window.apply();});
 resume.addEventListener('click',()=>{
  if(!saved||isLocked())return;
  const card=document.getElementById(saved.id);
  if(card.classList.contains('hidden')){
   onlyBookmarks=false;updateFavorites();document.getElementById('q').value='';document.getElementById('f-all').click();
  }
  card.scrollIntoView({block:'start',behavior:'instant'});
  card.setAttribute('tabindex','-1');card.focus({preventScroll:true});
 });
 function isLocked(){const gate=document.getElementById('gate');return gate&&getComputedStyle(gate).display!=='none';}
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);});schedule();});
 cards.forEach(card=>observer.observe(card));
 function measure(){
  frame=0;if(isLocked())return;
  const top=bar.getBoundingClientRect().bottom;
  const candidates=[...visible].filter(card=>!card.classList.contains('hidden')&&card.getBoundingClientRect().bottom>top+10).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
  if(!candidates.length)return;
  const card=candidates[0];const index=cards.indexOf(card)+1;
  tools.querySelector('#readerPosition').textContent='阅读位置 '+index+' / '+cards.length;
  tools.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(index));
  tools.querySelector('.reader-fill').style.width=(index/cards.length*100)+'%';
  current=card.id;
  const jump=document.getElementById('jump');if(jump)jump.value=card.closest('section').id;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(measure);}
 addEventListener('scroll',()=>{schedule();clearTimeout(saveTimer);saveTimer=setTimeout(()=>{
  if(current&&!isLocked()&&window.scrollY>100){saved={id:current};store('hltb:position',saved);updateResume();}
 },700);},{passive:true});
 addEventListener('pagehide',()=>{if(current&&!isLocked()&&window.scrollY>100)store('hltb:position',{id:current});});
 document.addEventListener('life:filtered',schedule);
 addEventListener('resize',schedule);
 const gate=document.getElementById('gate');if(gate)new MutationObserver(schedule).observe(gate,{attributes:true,attributeFilter:['style','class']});
 updateFavorites();updateResume();if(typeof window.syncBar==='function')window.syncBar();schedule();
})();
