import React from 'react';
import { createStore, useAtomValue } from 'jotai';
import { reloadable } from 'jotai-reloadable';

const store = createStore();
const countVal = { count: 0 };
const testApi = async (): Promise<
    | { greeting: string; countVal: { count: number } }
    | { error: string; countVal: { count: number } }
> => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            countVal.count++;
            if (countVal.count % 3 === 0) {
                res({ greeting: 'hello', countVal });
            } else {
                rej({ error: 'failed', countVal });
            }
        }, 1000);
    });
};

const testLoadableAtom = reloadable(testApi);

const Reload = () => {
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e => store.set(testLoadableAtom)}
        >
            Reload
        </button>
    );
};

const ReloadForce = () => {
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e => store.set(testLoadableAtom)}
        >
            Reload(pass) Forced
        </button>
    );
};

const TestData = () => {
    const countRef = React.useRef({ count: 0, arr: [] as any[] });
    const ret = useAtomValue(testLoadableAtom, { store: store });
    countRef.current.count++;
    countRef.current.arr.push(
        JSON.parse(JSON.stringify(ret)) as { count: number; arr: [] }
    );
    return (
        <div className='flex h-full flex-1 flex-col gap-4 rounded-md'>
            <div className='h-auto flex-1 rounded-md bg-white'>
                render count: {JSON.stringify(countRef.current, null, 4)}
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
                <Reload />
                <ReloadForce />
            </div>
        </div>
    );
};

export default Test;
