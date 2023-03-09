/**
 * jotai-reloadable
 *
 * Copyright 2023 Songhyeon Jun(shjeon0730@gmail.com)
 *
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or
 * without fee is hereby granted, provided that the above copyright notice and
 * this permission notice appear in all copies.
 * THE SOFTWARE IS PROVIDED “AS IS” AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
 * THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT,
 * OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE,
 * DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
 * ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * this file is written by Songhyeon Jun(shjeon0730@gmail.com)
 * and saved in https://github.com/wootra/jotai-reloadable for the first time.
 *
 */
import type { WritableAtom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';
export type ReloadableInitOptions = {
    forceReload?: boolean;
    retry?: number;
    printError?: boolean;
};
export type ReloadableOptions = {
    forceReload?: boolean;
};
export type ArgsWithOptions<T> = {
    args?: T;
    options: ReloadableOptions;
};
declare const SELF_RELOAD = "--self-reload--";
export type SelfReloadOption = typeof SELF_RELOAD;
export type ReloadableAtom<T, ARGS extends any[]> = WritableAtom<Loadable<Awaited<T>>, [
    action?: SelfReloadOption | ARGS | ArgsWithOptions<ARGS> | undefined
], void>;
/**
 *
 * @param func function difinition.
 * @param initArgs arguments of the function as an array form. if argument is a, b then, should be [a, b].
 * @param options default is { reloadOnlyError: true }
 * @returns
 */
export declare function reloadable<T, ARGS extends any[]>(func: (...args: ARGS) => Promise<T>, initArgs?: ARGS, options?: ReloadableInitOptions): ReloadableAtom<T, ARGS>;
export {};
