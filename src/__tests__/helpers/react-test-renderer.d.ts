declare module "react-test-renderer" {
  import type React from "react";
  export function create(element: React.ReactElement, options?: unknown): unknown;
  export function act(callback: () => void | Promise<void>): void;
}
