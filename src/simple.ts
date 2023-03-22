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

import type { WritableAtom, Getter, Setter } from 'jotai/vanilla';
import { atom } from 'jotai/vanilla';
import { loadable } from 'jotai/vanilla/utils';
import type { Loadable } from './types';

export type SimpleReloadableAtom<T, ARGS extends unknown[]> = WritableAtom<
    Loadable<Awaited<T>>,
    [() => Promise<T>, ...ARGS] | unknown[],
    void
> & { setRetryCount: (retryCount: number) => void };

/**
 * this is a simple version of reloadable.
 * you may want to add retry functionality by yourself.
 *
 * @param func function difinition.
 */
export function reloadable<T, ARGS extends unknown[]>(
    func: (...args: ARGS) => Promise<T>,
    ...initArgs: ARGS
): SimpleReloadableAtom<T, ARGS> {
    let _retryCount = 0;
    let _retryCountSaved = 0; // this can be set by setRetryCount.
    const wrapper: (
        funcToRun: (...args: ARGS) => Promise<T>,
        ...args: ARGS
    ) => Promise<T> = async (
        funcToRun: (...args: ARGS) => Promise<T>,
        ...args: ARGS
    ) => {
        try {
            const data = await funcToRun(...args);
            console.log('returned data:', data);
            return data;
        } catch (e) {
            if (_retryCount > 0) {
                _retryCount--;
                return await wrapper(funcToRun, ...args);
            } else {
                _retryCount = _retryCountSaved;
                throw e;
            }
        }
    };
    const baseAtom = atom(wrapper(func, ...initArgs));
    const loadableAtom = loadable(baseAtom);
    const reloadableAtom = atom(
        (get: Getter) => {
            return get(loadableAtom);
        },
        (
            get: Getter,
            set: Setter,
            refreshFunc: (...args: ARGS) => Promise<any> = func,
            ...args: ARGS
        ) => {
            if (args.length === 0) args = initArgs;
            if (refreshFunc !== func) {
                // re-run only when a new function is given.
                set(baseAtom, wrapper(refreshFunc, ...args));
            } else {
                if (get(loadableAtom).state === 'hasError') {
                    // run only when there is an error.
                    set(baseAtom, wrapper(refreshFunc, ...args));
                }
            }
        }
    );
    const copied = {
        ...reloadableAtom,
        setRetryCount: (retryCount: number) => {
            _retryCount = retryCount;
            _retryCountSaved = retryCount; //override retry count
        },
    } as unknown as SimpleReloadableAtom<T, ARGS>;
    return copied as SimpleReloadableAtom<T, ARGS>;
}
