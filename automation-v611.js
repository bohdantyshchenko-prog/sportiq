(() => {
  'use strict';
  if (!navigator.webdriver || !('serviceWorker' in navigator) || typeof ServiceWorkerContainer === 'undefined') return;

  navigator.serviceWorker.getRegistrations?.()
    .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
    .catch(() => undefined);

  const fakeRegistration = Object.freeze({
    waiting: null,
    installing: null,
    active: null,
    addEventListener() {},
    update: async () => undefined,
    unregister: async () => true
  });

  try {
    Object.defineProperty(ServiceWorkerContainer.prototype, 'register', {
      configurable: true,
      writable: true,
      value: async () => fakeRegistration
    });
  } catch {
    // Browser automation may expose a non-configurable prototype. In that
    // case the E2E context remains functional; production behavior is untouched.
  }
})();
