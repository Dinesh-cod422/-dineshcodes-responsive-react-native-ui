/**
 * Minimal `react` stub for unit tests. `useMemo` just runs the factory so hooks
 * can be exercised as plain functions outside a renderer.
 */
export const useMemo = <T>(factory: () => T, _deps?: unknown[]): T => factory();
