import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// jsdom tidak punya beberapa method DOM, jadi kita tiru
window.scrollTo = vi.fn();
window.matchMedia =
  window.matchMedia ||
  vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
URL.createObjectURL = vi.fn(() => "blob:mock-url");
URL.revokeObjectURL = vi.fn();

// Bersihkan state antar tes supaya tes tidak saling memengaruhi
afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});