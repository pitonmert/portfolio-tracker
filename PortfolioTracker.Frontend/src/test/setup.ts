import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Her testten sonra DOM'u temizle ve mock'ları sıfırla
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
