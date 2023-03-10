/**
 * @vitest-environment happy-dom
 */

import React, { useEffect, useState } from 'react'; // this line is essential to test react code
import { it, describe, expect, vi, beforeEach, afterEach } from 'vitest';
// import { Window } from 'happy-dom';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { simpleReloadable as reloadable } from 'jotai-reloadable';
import { createStore, Provider, useAtom, useAtomValue } from 'jotai';

type ServiceReturn = { pass: true; count: number };

const createServiceCall = (passCount = 3) => {
    let count = 0;
    return vi.fn((): Promise<ServiceReturn> => {
        return new Promise((res, rej) => {
            setTimeout(() => {
                count++;
                if (count % passCount === 0) res({ pass: true, count });
                else rej('wrong no:' + count);
            }, 1000);
        });
    });
};

const createComponent = () => {
    const serviceToCall = createServiceCall();
    const reloadableAtom = reloadable<ServiceReturn>(serviceToCall);
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

describe('Basic', () => {
    describe('Name of the group', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        afterEach(() => {
            vi.useRealTimers();
            cleanup();
        });
        it('should render', async () => {
            const TestPass = createComponent();
            await act(() => render(<TestPass />));
            expect(screen.getByTestId('result')).toBeTruthy();
        });

        it('should load on first render', async () => {
            const TestPass = createComponent();
            await act(() => render(<TestPass />));
            let result = window.document.getElementById('result');
            expect(result).toBeTruthy();
            expect(result?.innerHTML).toContain('loading');
            await act(() => vi.advanceTimersByTime(1000));
            result = window.document.getElementById('result');
            expect(result?.innerHTML).toContain('wrong no:1');
        });

        it('should fail on first render and pass eventually and does not try anymore', async () => {
            const TestPass = createComponent();
            await act(() => render(<TestPass />));
            await act(() => vi.advanceTimersByTime(1000)); //fail
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain('wrong no:1');
            await act(() =>
                window.document.getElementById('reload-btn')?.click()
            );
            await act(() => vi.advanceTimersByTime(1000)); //fail
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain('wrong no:2');
            await act(() =>
                window.document.getElementById('reload-btn')?.click()
            );
            await act(() => vi.advanceTimersByTime(1000)); //fail
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain(JSON.stringify({ pass: true, count: 3 }));
            // one more time should not trigger the count.
            await act(() =>
                window.document.getElementById('reload-btn')?.click()
            );
            await act(() => vi.advanceTimersByTime(1000)); //fail
            expect(
                window.document.getElementById('result')?.innerHTML
            ).toContain(JSON.stringify({ pass: true, count: 3 }));
        });
    });
});
