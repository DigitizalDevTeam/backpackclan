const memoryStore = new Map<string, unknown>();

function isFilesystemAvailable(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env.NEXT_RUNTIME !== "edge"
  );
}

function getDataDir(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  return path.join(process.cwd(), ".mock-data");
}

export function loadMockData<T>(key: string, fallback: T): T {
  if (memoryStore.has(key)) {
    return structuredClone(memoryStore.get(key) as T);
  }

  if (!isFilesystemAvailable()) {
    return structuredClone(fallback);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    const file = `${getDataDir()}/${key}.json`;
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf-8")) as T;
      memoryStore.set(key, data);
      return structuredClone(data);
    }
  } catch {
    // fall through to seed data
  }

  return structuredClone(fallback);
}

export function saveMockData<T>(key: string, data: T): void {
  memoryStore.set(key, data);

  if (!isFilesystemAvailable()) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    const dir = getDataDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/${key}.json`, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore write errors in read-only environments
  }
}
