(() => {
 document.querySelectorAll('.experience').forEach(experience=>{
  const updateTag=()=>{const tag=experience.querySelector('.tag');if(tag)tag.textContent=experience.open?'已展开':'点击展开';};
  experience.addEventListener('toggle',updateTag);updateTag();
 });
 document.querySelectorAll('.command').forEach(command=>{
  const code=command.querySelector('code');const head=command.querySelector('.command-head');
  if(!code||!head)return;
  const button=document.createElement('button');button.type='button';button.className='copy-command';button.textContent=command.dataset.copyLabel||'复制命令';button.setAttribute('aria-label','复制'+head.querySelector('strong').textContent);
  button.addEventListener('click',()=>BlogStudio.copy(code.textContent,button));head.append(button);
 });
})();
