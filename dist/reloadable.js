"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadable = void 0;
var jotai_1 = require("jotai");
var SELF_RELOAD = '--self-reload--';
/**
 *
 * @param func function difinition.
 * @param initArgs arguments of the function as an array form. if argument is a, b then, should be [a, b].
 * @param options default is { reloadOnlyError: true }
 * @returns
 */
function reloadable(func, initArgs, options) {
    if (initArgs === void 0) { initArgs = []; }
    if (options === void 0) { options = { forceReload: false }; }
    var statusHolder = { value: { state: 'init' } };
    var reloadablePromiseAtom = (0, jotai_1.atom)(func.apply(void 0, initArgs));
    reloadablePromiseAtom.debugLabel = 'reloadable__reloadablePromiseAtom';
    var resetAtom = (0, jotai_1.atom)(0);
    resetAtom.debugLabel = 'reloadable__resetAtom';
    var selfReloadOption = SELF_RELOAD;
    var reloadableAtom = (0, jotai_1.atom)(function (get, _a) {
        var setSelf = _a.setSelf;
        var data = statusHolder.value;
        var promise = get(reloadablePromiseAtom);
        get(resetAtom); // just for reset
        if (data.state === 'init') {
            statusHolder.value = { state: 'loading' };
            promise
                .then(function (result) {
                statusHolder.value = { state: 'hasData', data: result };
                setSelf(selfReloadOption);
            })
                .catch(function (err) {
                statusHolder.value = { state: 'hasError', error: err };
                setSelf(selfReloadOption);
            });
        }
        return statusHolder.value;
    }, function (get, set, action) {
        if (action === void 0) { action = initArgs; }
        if (action === SELF_RELOAD) {
            set(resetAtom, get(resetAtom) + 1);
            return;
        }
        var ret = statusHolder.value;
        var state = ret.state;
        if (state === 'loading' || state === 'init')
            return; // when it is already loading, it does not try to load again.
        var _a = getCurrentValue(action, initArgs, options), currArgs = _a[0], currOptions = _a[1];
        if (state === 'hasData') {
            if (currOptions === null || currOptions === void 0 ? void 0 : currOptions.forceReload) {
                statusHolder.value = { state: 'init' };
                set(reloadablePromiseAtom, func.apply(void 0, currArgs));
            }
        }
        else {
            statusHolder.value = { state: 'init' };
            set(reloadablePromiseAtom, func.apply(void 0, currArgs));
        }
    });
    reloadableAtom.debugLabel = 'reloadable__reloadableAtom';
    return reloadableAtom;
}
exports.reloadable = reloadable;
function getCurrentValue(action, initArgs, options) {
    if (Array.isArray(action)) {
        return [action, options];
    }
    else if (typeof action.options === 'object') {
        var act = action;
        return [act.args || initArgs, act.options || options];
    }
    else {
        return [initArgs, options];
    }
}
