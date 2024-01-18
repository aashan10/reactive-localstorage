declare const createSignal: <T>(value: T) => [() => T, (value: T) => void], createEffect: <T>(callback: () => T) => T, createMemo: <T>(fn: () => T) => () => T;
export declare const watch: (callback: () => void) => void;
export { createSignal, createEffect, createMemo };
export declare const createLocalStorageStore: <T>(name: string, initialValue: T) => [() => T, (v: T) => void];
