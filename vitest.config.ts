import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    environment: "node",
    include: ["tests/{unit,commands,smoke}/**/*.test.ts"],
    restoreMocks: true,
    testTimeout: 15_000,
  },
});
