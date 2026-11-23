import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// Polyfill matchMedia for jsdom using a plain function so vi.restoreAllMocks() never clears it
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Polyfill ResizeObserver for jsdom
if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'undefined') {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

// Quietly stub HTMLCanvasElement.prototype.getContext in jsdom unit tests
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
