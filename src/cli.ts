#!/usr/bin/env node

export const DEFAULT_CONFIG_PATH = "resume-renderer.config.json";
export const DEFAULT_PREVIEW_PORT = 4173;

export type CliCommand =
  | {
      command: "render";
      configPath: string;
      documentId?: string;
    }
  | {
      command: "preview";
      configPath: string;
      documentId?: string;
      port: number;
    };

export function parseCliArgs(args: string[]): CliCommand {
  const [commandName, ...rest] = args;

  if (commandName !== "render" && commandName !== "preview") {
    throw new Error(`Unknown command "${commandName ?? ""}". Expected "render" or "preview".`);
  }

  let configPath = DEFAULT_CONFIG_PATH;
  let documentId: string | undefined;
  let port = DEFAULT_PREVIEW_PORT;

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--config") {
      configPath = readFlagValue(rest, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--document") {
      documentId = readFlagValue(rest, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--port") {
      const value = Number.parseInt(readFlagValue(rest, index, arg), 10);
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new Error(`Invalid port "${rest[index + 1]}". Use a number from 1 to 65535.`);
      }
      port = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option "${arg}".`);
  }

  if (commandName === "preview") {
    return { command: "preview", configPath, documentId, port };
  }

  return { command: "render", configPath, documentId };
}

function readFlagValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  return value;
}

async function main(): Promise<void> {
  const command = parseCliArgs(process.argv.slice(2));
  throw new Error(`Command "${command.command}" is not wired yet.`);
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file://").href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
