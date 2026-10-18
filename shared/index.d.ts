import type { ToolSet } from 'ai';
export interface AceMediaOptions {
  /** Raw application API key; defaults to server ACEDATACLOUD_API_KEY. */
  apiKey?: string;
  /** Defaults to read-only. Generation can incur charges. */
  mode?: 'read-only' | 'generate';
  /** Explicit subset of the published service allowlist. */
  tools?: string[];
  /** Must return true per paid call; keep this policy under application control. */
  authorize?: (call: {service: string; toolName: string; input: unknown}) => boolean | Promise<boolean>;
}
export interface AceMediaConnection {
  tools: ToolSet;
  service: string;
  close(): Promise<void>;
}
