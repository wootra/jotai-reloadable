"use strict";
/**
 * jotai-reloadable
 * this file is written by Songhyeon Jun(shjeon0730@gmail.com)
 * and saved in https://github.com/wootra/jotai-reloadable for the first time.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reloadable = void 0;
var utils_1 = require("jotai/vanilla/utils");
var vanilla_1 = require("jotai/vanilla");
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
    var reloadableDataAtom = (0, vanilla_1.atom)((0, utils_1.loadable)((0, vanilla_1.atom)(func.apply(void 0, initArgs))));
    var reloadableAtom = (0, vanilla_1.atom)(function (get) {
        var loadableAtom = get(reloadableDataAtom);
        var ret = get(loadableAtom);
        return ret;
    }, function (get, set, action) {
        if (action === void 0) { action = {
            args: [],
            options: {},
        }; }
        var currAtom = get(reloadableDataAtom);
        var state = get(currAtom).state;
        if (state === 'loading')
            return; // when it is already loading, it does not try to load again.
        var args = Array.isArray(action)
            ? action
            : (action === null || action === void 0 ? void 0 : action.args) || initArgs;
        if (!Array.isArray(action) &&
            action &&
            !(action === null || action === void 0 ? void 0 : action.args) &&
            !Array.isArray(action === null || action === void 0 ? void 0 : action.args)) {
            throw new Error('action or action.args should be an array.');
        }
        var currOptions = Array.isArray(action)
            ? options
            : (action === null || action === void 0 ? void 0 : action.options) || options;
        if (state === 'hasData') {
            if (currOptions.forceReload) {
                set(reloadableDataAtom, (0, utils_1.loadable)((0, vanilla_1.atom)(func.apply(void 0, args))));
            }
        }
        else {
            set(reloadableDataAtom, (0, utils_1.loadable)((0, vanilla_1.atom)(func.apply(void 0, args))));
        }
    });
    return reloadableAtom;
}
exports.reloadable = reloadable;
