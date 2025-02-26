import { Buffer } from "buffer";

const getGlobalObject = () => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw new Error("Unable to locate global object");
};

export const initializeGlobals = () => {
  const globalObject = getGlobalObject();

  if (typeof globalThis.global === "undefined") {
    globalThis.global = globalObject;
  }
  if (typeof globalObject.Buffer === "undefined") {
    globalObject.Buffer = Buffer;
  }
  if (typeof globalObject.process === "undefined") {
    (globalObject as any).process = {
      env: { NODE_ENV: process.env.NODE_ENV || "development" },
    };
  }

  const checks = {
    global: typeof globalThis.global !== "undefined",
    buffer: typeof globalObject.Buffer !== "undefined",
    process: typeof globalObject.process !== "undefined",
  };

  if (!Object.values(checks).every((check) => check)) {
    console.error(
      "Failed to initialize some polyfills:",
      Object.entries(checks)
        .filter(([_, success]) => !success)
        .map(([name]) => name)
    );
    throw new Error("Polyfill initialization failed");
  }

  console.log("Global polyfills initialized successfully");
  return true;
};
