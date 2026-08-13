(() => {
  'use strict';

  const applyRelease = () => {
    const version = document.querySelector('.brand span');
    if (version) version.textContent = '6.1.1';
    document.documentElement.dataset.release = '6.1.1';
  };

  const reflectLocalProfileCommit = event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.closest('#prelaunchProfileDialog')) return;
    if (window.NOVIQ?.session) return;
    const name = String(window.NOVIQ?.state?.account?.displayName || '').trim();
    if (!name) return;
    const heading = document.querySelector('.prelaunch-profile .profile-identity h2');
    if (heading) heading.textContent = name;
  };

  window.addEventListener('DOMContentLoaded', () => requestAnimationFrame(applyRelease));
  window.addEventListener('noviq:language-changed', applyRelease);
  document.addEventListener('submit', reflectLocalProfileCommit);
})();
