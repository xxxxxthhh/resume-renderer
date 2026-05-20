import { createServer, type Server } from "node:http";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { escapeHtml } from "./html";

export interface PreviewServer {
  url: string;
  close(): Promise<void>;
}

export async function startStaticServer(rootDir: string, port: number): Promise<PreviewServer> {
  const absoluteRoot = path.resolve(rootDir);
  const server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      const filePath = resolveRequestPath(absoluteRoot, requestUrl.pathname);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        response.end(await renderDirectoryIndex(absoluteRoot, filePath));
        return;
      }

      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(await readFile(filePath));
    } catch (error) {
      const status = error instanceof ForbiddenPathError ? 403 : 404;
      response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
      response.end(status === 403 ? "Forbidden" : "Not found");
    }
  });

  await listen(server, port);
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    url: `http://localhost:${actualPort}/`,
    close: () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

function resolveRequestPath(rootDir: string, pathname: string): string {
  const decodedPath = decodeURIComponent(pathname);
  const filePath = path.resolve(rootDir, `.${decodedPath}`);

  if (filePath !== rootDir && !filePath.startsWith(`${rootDir}${path.sep}`)) {
    throw new ForbiddenPathError();
  }

  return filePath;
}

async function renderDirectoryIndex(rootDir: string, directory: string): Promise<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  const links = entries
    .filter((entry) => entry.isDirectory() || entry.name.endsWith(".html") || entry.name.endsWith(".pdf"))
    .map((entry) => {
      const href = path
        .relative(rootDir, path.join(directory, entry.name))
        .split(path.sep)
        .map(encodeURIComponent)
        .join("/");
      const label = entry.isDirectory() ? `${entry.name}/` : entry.name;
      return `<li><a href="/${href}${entry.isDirectory() ? "/" : ""}">${escapeHtml(label)}</a></li>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resume Renderer Preview</title>
  <style>
    body { margin: 32px; font-family: system-ui, sans-serif; color: #202124; }
    a { color: #2f6f5e; }
  </style>
</head>
<body>
  <h1>Resume Renderer Preview</h1>
  <ul>${links}</ul>
</body>
</html>`;
}

function contentType(filePath: string): string {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }

  if (filePath.endsWith(".pdf")) {
    return "application/pdf";
  }

  return "application/octet-stream";
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => {
      server.off("error", reject);
      resolve();
    });
  });
}

class ForbiddenPathError extends Error {}
