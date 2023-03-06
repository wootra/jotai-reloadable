import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { reloadable } from 'jotai-reloadable';

/**
 * jotai v1 has typescript bug. should add @ts-ignore or use jsx.
 */

interface TestApiResult {
    greeting: string;
    countVal: { count: number };
}
interface TestApiError {
    error: string;
    countVal: { count: number };
}

const countVal = { count: 0 };
const testApi = async (
    pass: boolean
): Promise<TestApiResult | TestApiError> => {
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

const LoadPass = ({ forced }: { forced: boolean } = { forced: true }) => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            type='button'
            className='rounded-md bg-blue-600 text-white'
            onClick={e =>
                forced
                    ? refresh({
                          // @ts-ignore
                          args: [true],
                          options: { forceReload: true },
                      })
                    : // @ts-ignore
                      refresh([true])
            }
        >
            Reload(pass) {forced ? 'forced' : ''}
        </button>
    );
};

const LoadFail = ({ forced }: { forced: boolean } = { forced: true }) => {
    const refresh = useSetAtom(testLoadableAtom);
    return (
        <button
            className='rounded-md bg-blue-600 text-white'
            onClick={e =>
                forced
                    ? refresh({
                          // @ts-ignore
                          args: [false],
                          options: { forceReload: true },
                      })
                    : // @ts-ignore
                      refresh([false])
            }
        >
            Reload(fail) {forced ? 'forced' : ''}
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
                <LoadPass forced={true} />
                <LoadPass forced={false} />
                <LoadFail forced={true} />
                <LoadFail forced={false} />
            </div>
        </div>
    );
};

export default Test;
