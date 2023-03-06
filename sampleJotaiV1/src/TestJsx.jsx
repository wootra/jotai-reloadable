import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { reloadable } from 'jotai-reloadable';

const countVal = { count: 0 };

/**
 *
 * @param {boolean} pass
 * @returns {Promise<{greeting: string, countVal: {count: number}}>}
 */
const testApi = async pass => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            countVal.count++;
            if (pass) {
                res({ greeting: 'hello', countVal });
            } else {
                rej({ error: 'failed', countVal });
            }
        }, 1000);
    });
};

const testLoadableAtom = reloadable(testApi, [false]);
testLoadableAtom.debugLabel = 'testLoadableAtom';

const LoadPassWrong = () => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e => refresh(true)}
        >
            Reload(pass) Wrong Type
        </button>
    );
};

const LoadPass = () => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e => refresh([true])}
        >
            Reload(pass)
        </button>
    );
};

const LoadFailWrong = () => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            className='rounded-md bg-blue-600 text-white'
            onClick={e => refresh(false)}
        >
            Reload(fail) Wrong Type
        </button>
    );
};

const LoadFail = () => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            className='rounded-md bg-blue-600 text-white'
            onClick={e => refresh([false])}
        >
            Reload(fail)
        </button>
    );
};

const TestData = () => {
    const ret = useAtomValue(testLoadableAtom);
    return (
        <div className='flex h-full flex-1 flex-col gap-4 rounded-md'>
            <div className='h-auto flex-1 rounded-md bg-white'>
                <pre>{JSON.stringify(ret, null, 4)}</pre>
            </div>
            <div className='h-8 rounded-md bg-white'>
                {ret.state === 'hasData' && JSON.stringify(ret.data)}
                {ret.state === 'hasError' && JSON.stringify(ret.error)}
                {ret.state === 'loading' && 'loading'}
            </div>
        </div>
    );
};

const Test = () => {
    return (
        <div className='flex h-96 w-[600px] flex-row gap-4 border border-gray-400 bg-slate-200 p-4'>
            <TestData />
            <div className='flex w-32 flex-col justify-center gap-4'>
                <LoadPassWrong />
                <LoadPass />
                <LoadFailWrong />
                <LoadFail />
            </div>
        </div>
    );
};

export default Test;
