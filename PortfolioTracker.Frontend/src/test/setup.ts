import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Clean up the DOM and reset mocks after each test.
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
