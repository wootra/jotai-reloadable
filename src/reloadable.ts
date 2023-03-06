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

import { loadable } from 'jotai/utils';
import { atom } from 'jotai';

export type ReloadableOptions = {
    forceReload?: boolean; // default is false
};

export type ArgsWithOptions<T> = {
    args?: T;
    options: ReloadableOptions;
};

/**
 *
 * @param func function difinition.
 * @param initArgs arguments of the function as an array form. if argument is a, b then, should be [a, b].
 * @param options default is { reloadOnlyError: true }
 * @returns
 */
export function reloadable<T, ARGS extends any[]>(
    func: (...args: ARGS) => Promise<T>,
    initArgs = [] as unknown[] as ARGS,
    options: ReloadableOptions = { forceReload: false }
) {
    const reloadableDataAtom = atom(func(...initArgs));

    const reloadableAtom = atom(
        get => {
            const ret = get(loadable(reloadableDataAtom));
            return ret;
        },
        (get, set, action: ARGS | ArgsWithOptions<ARGS> = initArgs) => {
            const { state } = get(loadable(reloadableDataAtom));
            if (state === 'loading') return; // when it is already loading, it does not try to load again.

            if (
                action &&
                !Array.isArray(action) &&
                action.args &&
                !Array.isArray(action.args)
            ) {
                throw new Error('action or action.args should be an array.');
            }
            const args = Array.isArray(action)
                ? action
                : action?.args || initArgs;
            const currOptions = Array.isArray(action)
                ? options
                : action?.options || options;
            if (state === 'hasData') {
                if (currOptions?.forceReload) {
                    set(reloadableDataAtom, func(...args));
                }
            } else {
                set(reloadableDataAtom, func(...args));
            }
        }
    );

    return reloadableAtom;
}
