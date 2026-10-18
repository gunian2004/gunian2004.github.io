(() => {
 'use strict';
 const cards=[...document.querySelectorAll('.knowledge-card')];
 const sections=[...document.querySelectorAll('.knowledge-section')];
 const search=document.getElementById('knowledgeSearch');
 let category='all';
 function plainText(node) {
  const clone=node.cloneNode(true);
  clone.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
  clone.querySelectorAll('li').forEach(li=>{li.prepend('• ');li.append('\n');});
  return clone.textContent.trim();
 }
 function cardText(card) {
  const text=plainText(card.querySelector('.knowledge-body'));
  return card.dataset.category==='prompts'?text:card.querySelector('h3').textContent+'\n'+text;
 }
 cards.forEach(card=>card.querySelector('.knowledge-copy').addEventListener('click',event=>BlogStudio.copy(cardText(card),event.currentTarget)));
 document.getElementById('copyAllRules').addEventListener('click',event=>{
  const text=cards.filter(card=>card.dataset.rule).map((card,i)=>(i+1)+'. '+cardText(card)).join('\n\n');
  BlogStudio.copy(text,event.currentTarget);
 });
 function apply() {
  const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  cards.forEach(card=>{
   const matches=(category==='all'||card.dataset.category===category)&&terms.every(term=>card.textContent.toLocaleLowerCase().includes(term));
   card.hidden=!matches;if(matches)count++;
  });
  sections.forEach(section=>section.hidden=![...section.querySelectorAll('.knowledge-card')].some(card=>!card.hidden));
  document.getElementById('knowledgeCount').textContent='找到 '+count+' 条笔记 / 共 '+cards.length+' 条';
  document.getElementById('knowledgeEmpty').hidden=count>0;
  document.getElementById('clearKnowledgeSearch').hidden=!search.value;
  document.querySelectorAll('.knowledge-filters button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
 }
 document.querySelectorAll('.knowledge-filters button').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;apply();}));
 search.addEventListener('input',apply);
 document.getElementById('clearKnowledgeSearch').addEventListener('click',()=>{search.value='';apply();search.focus();});
 document.getElementById('resetKnowledgeFilters').addEventListener('click',()=>{category='all';search.value='';apply();});
 apply();
})();
