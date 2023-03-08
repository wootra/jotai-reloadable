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

import type { Atom, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

export type ReloadableOptions = {
    forceReload?: boolean; // default is false
    self?: boolean;
};

export type ArgsWithOptions<T> = {
    args?: T;
    options: ReloadableOptions;
};

export type ReloadableAtom<T, ARGS extends any[]> = WritableAtom<
    Loadable<T>,
    [action?: SelfReloadOption | ARGS | ArgsWithOptions<ARGS> | undefined],
    void
>;

export type SelfReloadOption = { self: true; secret: number };

type Reloadable<Value> =
    | { state: 'loading' }
    | { state: 'hasError'; error: unknown }
    | { state: 'hasData'; data: Value }
    | { state: 'init' };

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
): ReloadableAtom<T, ARGS> {
    const statusHolder: { value: Reloadable<T> } = { value: { state: 'init' } };
    const reloadablePromiseAtom = atom(func(...initArgs));
    reloadablePromiseAtom.debugLabel = 'reloadable__reloadablePromiseAtom';
    const resetAtom = atom(0);
    resetAtom.debugLabel = 'reloadable__resetAtom';
    const selfReloadOption = { self: true, secret: 0 };
    const reloadableAtom = atom(
        (get, { setSelf }) => {
            const data = statusHolder.value;
            const promise = get(reloadablePromiseAtom);
            get(resetAtom); // just for reset
            if (data.state === 'init') {
                statusHolder.value = { state: 'loading' };
                promise
                    .then(result => {
                        statusHolder.value = { state: 'hasData', data: result };
                        setSelf(selfReloadOption);
                    })
                    .catch(err => {
                        statusHolder.value = { state: 'hasError', error: err };
                        setSelf(selfReloadOption);
                    });
            }
            return statusHolder.value as Loadable<T>;
        },
        (
            get,
            set,
            action: ARGS | ArgsWithOptions<ARGS> | SelfReloadOption = initArgs
        ) => {
            if (
                (action as SelfReloadOption)?.secret === selfReloadOption.secret
            ) {
                set(resetAtom, get(resetAtom) + 1);
                return;
            }
            const ret = statusHolder.value;
            const { state } = ret;
            if (state === 'loading' || state === 'init') return; // when it is already loading, it does not try to load again.
            const [currArgs, currOptions] = getCurrentValue<ARGS>(
                action,
                initArgs,
                options
            );

            if (state === 'hasData') {
                if (currOptions?.forceReload) {
                    statusHolder.value = { state: 'init' };
                    set(reloadablePromiseAtom, func(...currArgs));
                }
            } else {
                statusHolder.value = { state: 'init' };
                set(reloadablePromiseAtom, func(...currArgs));
            }
        }
    );
    reloadableAtom.debugLabel = 'reloadable__reloadableAtom';
    return reloadableAtom as unknown as ReloadableAtom<T, ARGS>;
}

function getCurrentValue<ARGS>(
    action: ARGS | ArgsWithOptions<ARGS> | SelfReloadOption,
    initArgs: ARGS,
    options: ReloadableOptions
) {
    if (Array.isArray(action)) {
        return [action, options] as [ARGS, ReloadableOptions];
    } else if (Array.isArray((action as ArgsWithOptions<ARGS>).args)) {
        const act = action as ArgsWithOptions<ARGS>;
        return [act.args || (initArgs as ARGS), act.options || options] as [
            ARGS,
            ReloadableOptions
        ];
    } else {
        return [initArgs, options] as [ARGS, ReloadableOptions];
    }
}
