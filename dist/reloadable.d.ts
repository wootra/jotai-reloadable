/**
 * jotai-reloadable
 * this file is written by Songhyeon Jun(shjeon0730@gmail.com)
 * and saved in https://github.com/wootra/jotai-reloadable for the first time.
 *
 */
interface ReloadableOptions {
    forceReload?: boolean;
}
/**
 *
 * @param func function difinition.
 * @param initArgs arguments of the function as an array form. if argument is a, b then, should be [a, b].
 * @param options default is { reloadOnlyError: true }
 * @returns
 */
export declare function reloadable<T, ARGS extends Array<unknown> | []>(func: ((...args: ARGS) => Promise<T>) | ((...args: ARGS) => Promise<unknown>), initArgs?: ARGS, options?: ReloadableOptions): import("jotai/vanilla").WritableAtom<import("jotai/vanilla/utils/loadable").Loadable<Promise<unknown>>, [action?: ARGS | {
    args?: ARGS | undefined;
    options: ReloadableOptions;
} | undefined], void>;
export {};
