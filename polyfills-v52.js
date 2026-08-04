(() => {
  'use strict';
  globalThis.NOVIQ = globalThis.NOVIQ || {};
  if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = value => JSON.parse(JSON.stringify(value));
  }
  if (!Array.prototype.at) {
    Object.defineProperty(Array.prototype, 'at', { value(index) { const i=index<0?this.length+index:index; return this[i]; }, configurable:true, writable:true });
  }
})();
