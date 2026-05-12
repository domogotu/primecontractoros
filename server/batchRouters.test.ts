import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
describe("Batch Routers", () => {
  it("has batch procedures", () => {
    const procs = Object.keys(appRouter._def.procedures);
    expect(procs.length).toBeGreaterThan(10);
  });
});
