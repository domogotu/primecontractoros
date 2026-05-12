import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Batch Router Registration", () => {
  it("appRouter has onboarding procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("onboarding.getProgress");
  });

  it("appRouter has subcontractors procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("subcontractors.list");
  });

  it("appRouter has vendors procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("vendors.list");
  });

  it("appRouter has diagnostics procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("diagnostics.getStatus");
  });

  it("appRouter has documentGeneration procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("documentGeneration.list");
  });

  it("appRouter has help procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("help.list");
  });

  it("appRouter has invites procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("invites.list");
  });

  it("appRouter has flowdownReviews procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("flowdownReviews.list");
  });

  it("appRouter has customerAdoption procedures", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("customerAdoption.getMetrics");
  });
});
