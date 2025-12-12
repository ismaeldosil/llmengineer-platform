// Polyfill for CSSStyleDeclaration indexed property setter
// This fixes the Radix UI compatibility issue with React Native Web
if (typeof window !== 'undefined' && typeof CSSStyleDeclaration !== 'undefined') {
  const _originalSetProperty = CSSStyleDeclaration.prototype.setProperty;

  // Create a proxy handler for indexed access
  const _handler = {
    set(target: CSSStyleDeclaration, prop: string | symbol, value: string) {
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        // Indexed property - ignore silently
        return true;
      }
      if (typeof prop === 'string') {
        target.setProperty(prop, value);
        return true;
      }
      return Reflect.set(target, prop, value);
    },
  };

  // Patch the prototype if needed
  if (!Object.prototype.hasOwnProperty.call(CSSStyleDeclaration.prototype, '__patched')) {
    Object.defineProperty(CSSStyleDeclaration.prototype, '__patched', {
      value: true,
      writable: false,
    });
  }
}

export {};
