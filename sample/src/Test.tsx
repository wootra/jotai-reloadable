import React from 'react';
import { createStore, useAtomValue } from 'jotai';
import { reloadable } from 'jotai-reloadable';

const store = createStore();
const countVal = { count: 0 };
const testApi = async (pass: boolean) => {
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

const testLoadableAtom = reloadable<
    { greeting: string } | { error: string },
    [boolean]
>(testApi, [false]);

const LoadPass = ({ forced }: { forced: boolean } = { forced: true }) => {
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e =>
                forced
                    ? store.set(testLoadableAtom, {
                          args: [true],
                          options: { forceReload: true },
                      })
                    : store.set(testLoadableAtom, [true])
            }
        >
            Reload(pass) {forced ? 'forced' : ''}
        </button>
    );
};

const LoadFail = ({ forced }: { forced: boolean } = { forced: true }) => {
    return (
        <button
            className='rounded-md bg-blue-600 text-white'
            onClick={e =>
                forced
                    ? store.set(testLoadableAtom, {
                          args: [false],
                          options: { forceReload: true },
                      })
                    : store.set(testLoadableAtom, [false])
            }
        >
            Reload(fail) {forced ? 'forced' : ''}
        </button>
    );
};

const TestData = () => {
    const ret = useAtomValue(testLoadableAtom, { store: store });
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
                <LoadPass forced={true} />
                <LoadPass forced={false} />
                <LoadFail forced={true} />
                <LoadFail forced={false} />
            </div>
        </div>
    );
};

export default Test;
