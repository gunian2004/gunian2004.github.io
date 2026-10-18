(() => {
 const experience=document.querySelector('.experience');
 if(experience)experience.addEventListener('toggle',()=>{const tag=experience.querySelector('.tag');if(tag)tag.textContent=experience.open?'已展开':'点击展开';});
 document.querySelectorAll('.command').forEach(command=>{
  const code=command.querySelector('code');const head=command.querySelector('.command-head');
  if(!code||!head)return;
  const button=document.createElement('button');button.type='button';button.className='copy-command';button.textContent='复制命令';button.setAttribute('aria-label','复制'+head.querySelector('strong').textContent);
  button.addEventListener('click',()=>BlogStudio.copy(code.textContent,button));head.append(button);
 });
})();
