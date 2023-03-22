import type { WritableAtom } from 'jotai';

export type Loadable<Value> =
    | {
          state: 'loading';
      }
    | {
          state: 'hasError';
          error: unknown;
      }
    | {
          state: 'hasData';
          data: Awaited<Value>;
      };

export type ReloadableInitOptions = {
    forceReload?: boolean; // default is false
    retry?: number; // default is 0
    printError?: boolean; // default is false
};

export type ReloadableOptions = {
    forceReload?: boolean; // default is false
};

export type ArgsWithOptions<ARGS extends any[]> = {
    args?: ARGS;
    options: ReloadableOptions;
};

export const FORCE_RELOAD = Symbol('force reload');

export interface ReloadableAtom<T, F extends (...args: any) => Promise<T>>
    extends WritableAtom<
        Loadable<Awaited<T>>,
        Parameters<F> | [typeof FORCE_RELOAD, ...Parameters<F>],
        void
    > {
    setRetryCount: (retryCount: number) => void;
    setForceReload: (forceReload: boolean) => void;
}

export type Reloadable<Value> =
    | { state: 'loading' }
    | { state: 'hasError'; error: unknown }
    | { state: 'hasData'; data: Value }
    | { state: 'init' };
