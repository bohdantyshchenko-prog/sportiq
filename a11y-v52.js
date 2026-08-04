(() => {
  'use strict';
  const sync = () => {
    const modal = document.querySelector('#modal');
    const main = document.querySelector('#main');
    if (!modal || !main) return;
    const open = modal.classList.contains('open');
    main.removeAttribute('inert');
    [...main.children].forEach(child => {
      if (child === modal || child.id === 'toast' || child.id === 'updateBar') return;
      if (open) child.setAttribute('inert', ''); else child.removeAttribute('inert');
    });
    if (open && !modal.contains(document.activeElement)) {
      modal.querySelector('.sheet button,.sheet textarea,.sheet input,.sheet [tabindex="0"]')?.focus();
    }
  };
  const observer = new MutationObserver(sync);
  const start = () => {
    const modal = document.querySelector('#modal');
    if (modal) observer.observe(modal, { attributes:true, attributeFilter:['class','aria-hidden'] });
    sync();
  };
  document.addEventListener('click', () => queueMicrotask(sync));
  document.addEventListener('submit', () => queueMicrotask(sync));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start();
})();
