/**
 * @vitest-environment happy-dom
 */

import React from 'react'; // this line is essential to test react code
import { it, describe, expect, vi, beforeEach } from 'vitest';
// import { Window } from 'happy-dom';
import { render } from '@testing-library/react';
import Test from './Test';
const window = new Window();

const document = window.document;
document.body.innerHTML = '<div id="root"></div>';
// vi.useFakeTimers();

describe('Test', () => {
    describe('Name of the group', () => {
        beforeEach(() => {
            // vi.useFakeTimers();
        });
        it('should render', async () => {
            const container = await document.getElementById('root');
            expect(container).not.toBeNull();
            if (!container) return;
            const element = render(<Test />, { container: container });
            expect(element).toBeTruthy();
        });

        it('should fail on first render', async () => {
            const element = render(<Test />, { container: document.body });
            let result = await element.getByTestId('result');
            expect(result).toBeTruthy();
            expect(result.textContent).toContain('loading');
            // vi.advanceTimersByTimeAsync(2000);
            result = await element.getByTestId('result');
            // expect(result.textContent).toContain('error');
        });
    });
});
