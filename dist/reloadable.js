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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
    var _a = buildInitStates(options, func), statusHolder = _a.statusHolder, PromiseWrapper = _a.PromiseWrapper;
    var reloadablePromiseAtom = (0, jotai_1.atom)(PromiseWrapper.apply(void 0, initArgs));
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
                statusHolder.value = result; // this could be hasError or hasData
                setSelf(selfReloadOption);
                return result; // this could be hasError or hasData
            })
                .catch(function (err) {
                statusHolder.value = { state: 'hasError', error: err };
                setSelf(selfReloadOption);
            });
        }
        return statusHolder.value;
    }, function (get, set, action) {
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
                set(reloadablePromiseAtom, PromiseWrapper.apply(void 0, currArgs));
            }
        }
        else {
            statusHolder.value = { state: 'init' };
            set(reloadablePromiseAtom, PromiseWrapper.apply(void 0, currArgs));
        }
    });
    reloadableAtom.debugLabel = 'reloadable__reloadableAtom';
    return reloadableAtom;
}
exports.reloadable = reloadable;
function buildInitStates(options, func) {
    var _this = this;
    var statusHolder = { value: { state: 'init' } };
    var retrySate = { count: options.retry || 0, init: false };
    var PromiseWrapper = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var data, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        if (!retrySate.init) {
                            retrySate.init = true;
                            retrySate.count = options.retry || 0;
                        }
                        else {
                            retrySate.count--;
                        }
                        return [4 /*yield*/, func.apply(void 0, args)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, { state: 'hasData', data: data }];
                    case 2:
                        e_1 = _a.sent();
                        if (!(retrySate.count > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, PromiseWrapper.apply(void 0, args)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        retrySate.init = false;
                        if (options.printError)
                            console.error(e_1);
                        if (e_1 instanceof Error) {
                            return [2 /*return*/, { state: 'hasError', error: e_1.message }];
                        }
                        else {
                            return [2 /*return*/, { state: 'hasError', error: e_1 }];
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return { statusHolder: statusHolder, PromiseWrapper: PromiseWrapper };
}
function getCurrentValue(action, initArgs, options) {
    if (Array.isArray(action)) {
        return [action, options];
    }
    else if (typeof (action === null || action === void 0 ? void 0 : action.options) === 'object') {
        var act = action;
        return [act.args || initArgs, act.options || options];
    }
    else {
        checkActionType(action);
        return [initArgs, options];
    }
}
function checkActionType(action) {
    if (action !== undefined &&
        !Array.isArray(action) &&
        typeof action !== 'object') {
        throw new Error("reloadable atom should be called with one of the types: array(function's argument), { args?:[], } ");
    }
}
