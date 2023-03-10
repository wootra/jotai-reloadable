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

import type { Getter, Setter, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';

export type ReloadableInitOptions = {
    forceReload?: boolean; // default is false
    retry?: number; // default is 0
    printError?: boolean; // default is false
};

export type ReloadableOptions = {
    forceReload?: boolean; // default is false
};

export type ArgsWithOptions<T> = {
    args?: T;
    options: ReloadableOptions;
};

const SELF_RELOAD = '--self-reload--';
export type SelfReloadOption = typeof SELF_RELOAD;

export type ReloadableAtom<T, ARGS extends any[]> = WritableAtom<
    Loadable<Awaited<T>>,
    [action?: SelfReloadOption | ARGS | ArgsWithOptions<ARGS> | undefined],
    void
>;

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
    options: ReloadableInitOptions = { forceReload: false }
): ReloadableAtom<T, ARGS> {
    const { statusHolder, PromiseWrapper } = buildInitStates(options, func);

    const reloadablePromiseAtom = atom(PromiseWrapper(...initArgs));
    reloadablePromiseAtom.debugLabel = 'reloadable__reloadablePromiseAtom';
    const resetAtom = atom(0);
    resetAtom.debugLabel = 'reloadable__resetAtom';
    const selfReloadOption = SELF_RELOAD;

    const reloadableAtom = atom(
        (get: Getter, { setSelf }) => {
            const data = statusHolder.value;
            const promise = get(reloadablePromiseAtom);
            get(resetAtom); // just for reset
            if (data.state === 'init') {
                statusHolder.value = { state: 'loading' };
                promise
                    .then(result => {
                        statusHolder.value = result as Loadable<T>; // this could be hasError or hasData
                        setSelf(selfReloadOption);
                        return result; // this could be hasError or hasData
                    })
                    .catch(err => {
                        statusHolder.value = { state: 'hasError', error: err };
                        setSelf(selfReloadOption);
                    });
            }
            return statusHolder.value as Loadable<T>;
        },
        (
            get: Getter,
            set: Setter,
            action: ARGS | ArgsWithOptions<ARGS> | SelfReloadOption | undefined
        ) => {
            if (action === SELF_RELOAD) {
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
                    set(reloadablePromiseAtom, PromiseWrapper(...currArgs));
                }
            } else {
                statusHolder.value = { state: 'init' };
                set(reloadablePromiseAtom, PromiseWrapper(...currArgs));
            }
        }
    );
    reloadableAtom.debugLabel = 'reloadable__reloadableAtom';
    return reloadableAtom as unknown as ReloadableAtom<T, ARGS>;
}

function buildInitStates<T, ARGS extends any[]>(
    options: ReloadableInitOptions,
    func: (...args: ARGS) => Promise<T>
) {
    const statusHolder: { value: Reloadable<T> } = { value: { state: 'init' } };
    const retrySate = { count: options.retry || 0, init: false };
    const PromiseWrapper = async (...args: ARGS): Promise<Loadable<T>> => {
        try {
            if (!retrySate.init) {
                retrySate.init = true;
                retrySate.count = options.retry || 0;
            } else {
                retrySate.count--;
            }
            const data = await func(...args);
            return { state: 'hasData', data: data };
        } catch (e) {
            if (retrySate.count > 0) {
                return await PromiseWrapper(...args);
            }
            retrySate.init = false;
            if (options.printError) console.error(e);
            if (e instanceof Error) {
                return { state: 'hasError', error: e.message };
            } else {
                return { state: 'hasError', error: e };
            }
        }
    };
    return { statusHolder, PromiseWrapper };
}

function getCurrentValue<ARGS>(
    action: ARGS | ArgsWithOptions<ARGS> | SelfReloadOption | undefined,
    initArgs: ARGS,
    options: ReloadableOptions
) {
    if (Array.isArray(action)) {
        return [action, options] as [ARGS, ReloadableOptions];
    } else if (typeof (action as ArgsWithOptions<ARGS>)?.options === 'object') {
        const act = action as ArgsWithOptions<ARGS>;
        return [act.args || (initArgs as ARGS), act.options || options] as [
            ARGS,
            ReloadableOptions
        ];
    } else {
        checkActionType<ARGS>(
            action as ARGS | ArgsWithOptions<ARGS> | undefined
        );
        return [initArgs, options] as [ARGS, ReloadableOptions];
    }
}

function checkActionType<ARGS>(
    action: ARGS | ArgsWithOptions<ARGS> | undefined
) {
    if (
        action !== undefined &&
        !Array.isArray(action) &&
        typeof action !== 'object'
    ) {
        throw new Error(
            `reloadable atom should be called with one of the types: array(function's argument), { args?:[], } `
        );
    }
}
