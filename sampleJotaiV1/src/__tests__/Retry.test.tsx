/**
 * @vitest-environment happy-dom
 */

import React, { useEffect, useState } from 'react'; // this line is essential to test react code
import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest';
// import { Window } from 'happy-dom';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { reloadable } from '../../../src/reloadable';
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
    const reloadableAtom = reloadable(serviceToCall, [], { retry });
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
