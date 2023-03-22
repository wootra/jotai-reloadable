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

import type { Getter, Setter } from 'jotai/vanilla';
import { atom } from 'jotai/vanilla';
import { loadable } from 'jotai/vanilla/utils';
import { FORCE_RELOAD, Loadable, ReloadableAtom } from './types';

/**
 * this is a simple version of reloadable.
 * you may want to add retry functionality by yourself.
 *
 * @param func function difinition.
 */
export function reloadable<T, F extends (...args: any[]) => Promise<T>>(
    func: F,
    ...initArgs: Parameters<F>
): ReloadableAtom<T, F> {
    const infoHolder = {
        retryCount: 0,
        retryCountSaved: 0,
        forceReload: false,
        func: func,
        parameters: initArgs,
    };
    const wrapper: (
        funcToRun: F,
        ...args: Parameters<F>
    ) => Promise<T> = async (funcToRun, ...args) => {
        try {
            const data = await funcToRun(...args);
            return data as T;
        } catch (e) {
            if (infoHolder.retryCount > 0) {
                infoHolder.retryCount--;
                return await wrapper(funcToRun, ...args);
            } else {
                infoHolder.retryCount = infoHolder.retryCountSaved; //reset retry count
                throw e;
            }
        }
    };
    const baseAtom = atom(wrapper(func, ...initArgs));
    const loadableAtom = loadable(baseAtom);
    const reloadableAtom = atom(
        (get: Getter) => get(loadableAtom) as Loadable<Awaited<T>>,
        (
            get: Getter,
            set: Setter,
            ...args: Parameters<F> | [typeof FORCE_RELOAD, ...Parameters<F>]
        ) => {
            if (args.length === 0) args = infoHolder.parameters;
            const prevState = get(loadableAtom).state;
            if (
                prevState === 'hasError' ||
                infoHolder.forceReload ||
                (args as [typeof FORCE_RELOAD, ...Parameters<F>])[0] ===
                    FORCE_RELOAD ||
                (args as Parameters<F>).some(
                    //argument is different, then reload even if previous result passed.
                    (arg, idx) => infoHolder.parameters[idx] !== arg
                )
            ) {
                // run only when there is an error.
                if (args[0] === FORCE_RELOAD) {
                    args.shift();
                }
                let newArgs = args as Parameters<F>;
                if (newArgs.length === 0) newArgs = infoHolder.parameters;
                else {
                    infoHolder.parameters = newArgs;
                }

                set(baseAtom, wrapper(infoHolder.func, ...newArgs));
            }
        }
    );
    const copied = {
        ...reloadableAtom,
        setRetryCount: (retryCount: number) => {
            infoHolder.retryCount = retryCount;
            infoHolder.retryCountSaved = retryCount; //override retry count
        },
        setForceReload: (forceReload: boolean) => {
            infoHolder.forceReload = forceReload;
        },
    } as unknown as ReloadableAtom<T, F>;
    return copied as ReloadableAtom<T, F>;
}
