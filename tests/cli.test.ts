import { describe, expect, it } from "vitest";

import { parseCliArgs } from "../src/cli";

describe("parseCliArgs", () => {
  it("defaults to rendering all configured documents", () => {
    expect(parseCliArgs(["render"])).toEqual({
      command: "render",
      configPath: "resume-renderer.config.json",
      documentId: undefined,
    });
  });

  it("parses a selected document and custom config path", () => {
    expect(parseCliArgs(["render", "--document", "resume", "--config", "custom.json"])).toEqual({
      command: "render",
      configPath: "custom.json",
      documentId: "resume",
    });
  });

  it("parses preview with a default port", () => {
    expect(parseCliArgs(["preview"])).toEqual({
      command: "preview",
      configPath: "resume-renderer.config.json",
      documentId: undefined,
      port: 4173,
    });
  });

  it("parses preview with a custom port", () => {
    expect(parseCliArgs(["preview", "--port", "5000"])).toEqual({
      command: "preview",
      configPath: "resume-renderer.config.json",
      documentId: undefined,
      port: 5000,
    });
  });
});
