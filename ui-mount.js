(() => {
  const N=window.NOVIQ=window.NOVIQ||{};
  document.body.innerHTML=N.uiMarkup||'<main>Unable to load NOVIQ UI</main>';

  const brandVersion=document.querySelector('.brand i');
  if(brandVersion) brandVersion.textContent=N.config?.version||'1.4';

  const topActions=document.querySelector('.top-actions');
  if(topActions && !topActions.querySelector('[data-action="toggle-theme"]')){
    const themeButton=document.createElement('button');
    themeButton.type='button';
    themeButton.className='theme-toggle pressable';
    themeButton.dataset.action='toggle-theme';
    themeButton.setAttribute('aria-label','Switch light or dark theme');
    themeButton.innerHTML='<span aria-hidden="true">◐</span>';
    topActions.insertBefore(themeButton,topActions.firstChild);
  }

  const avatar=document.querySelector('.avatar-button');
  if(avatar){
    avatar.setAttribute('title','Профиль Богдана');
    avatar.setAttribute('aria-label','Открыть профиль Богдана');
  }

  const dailyHero=document.querySelector('.daily-hero');
  if(dailyHero){
    dailyHero.classList.add('has-premium-media');
    const copy=dailyHero.querySelector('.daily-heading p');
    if(copy) copy.textContent='Фокус дня: качество аргументов, управление риском и честная уверенность.';
  }

  document.querySelectorAll('.update-card').forEach((card,index)=>{
    card.classList.add('media-story-card');
    card.style.setProperty('--story-index',String(index));
  });
})();
