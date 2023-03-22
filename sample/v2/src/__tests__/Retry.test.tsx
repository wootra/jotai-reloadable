/**
 * @vitest-environment happy-dom
 */

import React, { useEffect, useState } from 'react'; // this line is essential to test react code
import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { reloadable } from 'jotai-reloadable';
import { createStore, Provider, useAtom, useAtomValue } from 'jotai';

const createServiceCall = (passCount = 3) => {
    let count = 0;
    return () => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                count++;
                if (count % passCount === 0) res({ pass: true, count });
                else rej('wrong no:' + count);
            }, 1000);
        });
    };
};

const createComponent = (retry = 2) => {
    const serviceToCall = createServiceCall();
    const reloadableAtom = reloadable(serviceToCall);
    reloadableAtom.setRetryCount(2);
    const store = createStore();

    return function () {
        const ret = useAtomValue(reloadableAtom, { store: store });
        return (
            <Provider store={store}>
                <div className='flex h-full flex-1 flex-col gap-4 rounded-md'>
                    <button
                        id='reload-btn'
                        onClick={() => store.set(reloadableAtom)}
                    >
                        reload
                    </button>
                    <div
                        className='h-8 rounded-md bg-white'
                        data-testid='result'
                        id='result'
                    >
                        {ret.state === 'hasData' && JSON.stringify(ret.data)}
                        {ret.state === 'hasError' && JSON.stringify(ret.error)}
                        {ret.state === 'loading' && 'loading'}
                    </div>
                </div>
            </Provider>
        );
    };
};

describe('Retry', () => {
    describe('Name of the group', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        afterEach(() => {
            vi.useRealTimers();
            cleanup();
        });

        it('should pass on first render with 2 retry', async () => {
            const TestPass = createComponent(2);
            await act(() => render(<TestPass />));
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain('loading');
            await act(() => vi.advanceTimersByTimeAsync(5000)); // with 2 retry, it will pass
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain(JSON.stringify({ pass: true, count: 3 }));
        });
    });
});

interface CancelablePromise<T> extends Promise<T> {
    cancel: (isPass: boolean) => void;
}

describe('cancel promise', () => {
    const testService = async (pass = true) => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                if (pass) res('service passed');
                else rej('service failed');
            }, 1000);
        });
    };
    it('should cancel promise when service passes', async () => {
        const aPromise = new Promise((res, rej) => {
            testService().then(res).catch(rej);
        })
            .then(res => {
                console.log('finished', res);
                return res;
            })
            .catch(err => {
                console.error('error', err);
            });
        // (aPromise as PromiseWithCancel<any>).canceled = true;
        let cancel;
        const cancelPromise = new Promise((res, rej) => {
            const pass = res.bind(null, { canceled: true });
            const fail = rej.bind(null, { canceled: true });
            cancel = isPass => {
                isPass ? pass() : fail();
            };
        });
        const cancelablePromise = Object.assign(
            Promise.race([aPromise, cancelPromise]),
            { cancel }
        );
        cancelablePromise.cancel(true);
        const res = await cancelablePromise;
        expect(res).toStrictEqual({ canceled: true });

        await new Promise(res => setTimeout(res, 2000)); // make this test wait
    });

    it('should cancel promise when service fails', async () => {
        const aPromise = new Promise((res, rej) => {
            testService(false).then(res).catch(rej);
        })
            .then(res => {
                console.log('finished', res);
                return res;
            })
            .catch(err => {
                console.error('error', err);
            });
        // (aPromise as PromiseWithCancel<any>).canceled = true;
        let cancel;
        const cancelPromise = new Promise((res, rej) => {
            const pass = res.bind(null, { canceled: true });
            const fail = rej.bind(null, { canceled: true });
            cancel = isPass => {
                isPass ? pass() : fail();
            };
        });
        const racePromise = Promise.race([aPromise, cancelPromise]);
        const cancelablePromise = Object.assign(racePromise, {
            cancel,
        });

        const afterCancelablePromise = cancelablePromise.then(res => {
            console.log('promise after cancel is', res);
            (res as any).runAfterCancel = true;
            return res;
        }) as CancelablePromise<any>;

        cancelablePromise.cancel(true);
        const res = await afterCancelablePromise;
        expect(res).toStrictEqual({ canceled: true, runAfterCancel: true });

        await new Promise(res => setTimeout(res, 2000)); // make this test wait
    });
});
