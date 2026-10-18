(() => {
 const cards=[...document.querySelectorAll('.hub-card')];const search=document.getElementById('hubSearch');let group='all';
 function apply(){const query=search.value.trim().toLowerCase();let count=0;cards.forEach(card=>{card.hidden=!((group==='all'||card.dataset.group===group)&&card.textContent.toLowerCase().includes(query));if(!card.hidden)count++;});document.getElementById('hubCount').textContent='找到 '+count+' 个类目 / 共 '+cards.length+' 个';document.getElementById('hubEmpty').hidden=count>0;document.getElementById('hubClear').hidden=!search.value;document.querySelectorAll('.hub-filters button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.group===group)));}
 search.addEventListener('input',apply);document.querySelectorAll('.hub-filters button').forEach(button=>button.addEventListener('click',()=>{group=button.dataset.group;apply();}));
 document.getElementById('hubClear').addEventListener('click',()=>{search.value='';apply();search.focus();});document.getElementById('hubReset').addEventListener('click',()=>{search.value='';group='all';apply();});apply();
})();
