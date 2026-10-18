/* Scoped token playground: changing controls never changes the documentation. */
(function () {
  'use strict';
  var live=document.getElementById('specLive'),radius=document.getElementById('specRadius'),code=document.getElementById('specTokenCode'),status=document.getElementById('specCopyStatus');
  var state={radius:12,gap:12,color:'#476658'};
  function update(){live.style.setProperty('--lab-radius',state.radius+'px');live.style.setProperty('--lab-gap',state.gap+'px');live.style.setProperty('--lab-accent',state.color);document.getElementById('specRadiusValue').value=state.radius+' px';code.textContent='--radius: '+state.radius+'px;\n--space: '+state.gap+'px;\n--accent: '+state.color+';';status.textContent='';document.querySelectorAll('[data-lab-density]').forEach(function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.labDensity)===state.gap));});document.querySelectorAll('[data-lab-color]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.labColor===state.color));});}
  radius.addEventListener('input',function(){state.radius=Number(radius.value);update();});
  document.querySelectorAll('[data-lab-density]').forEach(function(b){b.addEventListener('click',function(){state.gap=Number(b.dataset.labDensity);update();});});
  document.querySelectorAll('[data-lab-color]').forEach(function(b){b.addEventListener('click',function(){state.color=b.dataset.labColor;update();});});
  document.getElementById('specPreviewAction').addEventListener('click',function(){var on=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(on));this.textContent=on?'已选择 ✓':'选择这套风格';});
  document.getElementById('specCopyTokens').addEventListener('click',async function(){try{if(!navigator.clipboard)throw new Error('fallback');await navigator.clipboard.writeText(code.textContent);status.textContent='CSS 令牌已复制。';}catch(e){var ta=document.createElement('textarea');ta.value=code.textContent;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();var ok=false;try{ok=document.execCommand('copy');}catch(ignore){}ta.remove();status.textContent=ok?'CSS 令牌已复制。':'复制未成功，可直接选取上方代码。';}});update();
})();
