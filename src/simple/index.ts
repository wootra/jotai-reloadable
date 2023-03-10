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

import type { WritableAtom, Getter, Setter } from 'jotai';
import { atom } from 'jotai/vanilla';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import { loadable } from 'jotai/vanilla/utils';

export type SimpleReloadableAtom<T> = WritableAtom<
    Loadable<Awaited<T>>,
    [() => Promise<T>] | [],
    void
>;

/**
 * this is a simple version of reloadable.
 * you may want to add retry functionality by yourself.
 *
 * @param func function difinition.
 */
export function reloadable<T>(func: () => Promise<T>): SimpleReloadableAtom<T> {
    const baseAtom = atom(func());
    const loadableAtom = loadable(baseAtom);
    const reloadableAtom = atom(
        (get: Getter) => get(loadableAtom),
        (
            get: Getter,
            set: Setter,
            refreshFunc: (() => Promise<any>) | undefined = func
        ) => {
            if (refreshFunc !== func) {
                // re-run only when a new function is given.
                set(baseAtom, refreshFunc());
            } else {
                if (get(loadableAtom).state === 'hasError') {
                    // run only when there is an error.
                    set(baseAtom, refreshFunc());
                }
            }
        }
    );
    return reloadableAtom as SimpleReloadableAtom<T>;
}
