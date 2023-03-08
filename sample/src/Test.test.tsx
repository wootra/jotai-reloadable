/**
 * @vitest-environment jsdom
 */

import { it, describe, expect } from 'vitest';
import { render } from '@testing-library/react';
import Test from './Test';

describe('Test', () => {
    describe('Name of the group', () => {
        it('should render', () => {
            const element = render(<Test />);
            expect(element).toBeTruthy();
        });

        it('should render', () => {
            const element = render(<Test />);
            element.getByTestId('');
        });
    });
});
