(() => {
  'use strict';
  const apply = () => {
    const version = document.querySelector('.brand span');
    if (version) version.textContent = '6.1.1';
    document.documentElement.dataset.release = '6.1.1';
  };
  window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(apply));
  window.addEventListener('noviq:language-changed', apply);
})();
