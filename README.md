# jotai-reloadable

## limitation

this library is tested in jotai-v2. jotai-v1 has an issue that fails.
you can still use it in jotai-v1, but typescript has bug in the jotai v1 core, so you should use jsx or // @ts-ignore in the tsx file

## Motivation

loadable in jotai library is not re-loadable. I wanted to make it run again, but didn't have much luck

```
import {loadable} from 'jotai/utils';
import { atom, createStore, useAtomValue } from 'jotai';

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

const loadableAtom = loadable(atom(testApi(false)))
// how can I reload loadableAtom ??

const store = createStore();

const MyComponent = ()=>{
    const ret = useAtomValue(loadableAtom, {store}); // since testApi(false) will return fail value, it will be always return { state: 'hasError', error: {...}}
    return <pre>
       {JSON.stringify(ret)}
    </pre>
}

```

But sometimes testApi is just unstable. So if this component is reloaded, or if some action is give, I want to reload the value from testApi.
But seems like there is no easy way without manually setup the atom not using loadable util.

I wanted to have some simple way of re-load the async atom value. I named it as jotai-reloadable.

Since this async function can get some argument, sometimes it can be given when I trigger the reload.

```
import {reloadable} from 'jotai-reloadable'; // instead of loadable, use reloadable from 'jotai-reloadable'
import { atom, createStore, useAtomValue } from 'jotai';

const countVal = { count: 0 }; // to check if the service call is duplicated.
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

const loadableAtom = reloadable(testApi, [false]); // instead of using loadable, use reloadable and pass async function and its initial argument(optional)

const store = createStore();

const MyComponent = ()=>{
    const ret = useAtomValue(loadableAtom, {store}); // since testApi(false) will return fail value, it will be always return { state: 'hasError', error: {...}}
    return <div>
       <pre>
       {JSON.stringify(ret)}
       </pre>
       <button onClick=()=>{store.set(loadableAtom, [true])}>reload</button>
    </div>
}
```

Now, we can "reload" the failed service call. Note [true] is passed as the arguments of the testApi function.

Also, you will see loadableAtom is not updated once loadable success. (state == 'hasData').

But sometimes, we need to "force" to call the service once more.

Then we can pass option to force reload.

```
<button onClick=()=>{
    store.set(loadableAtom, {
        args:[true],
        options: { forceReload: true }
    })
    }>
    reload
</button>
```

You also can set the reload option as a default function by adding the option when you setup the atom.

```
const loadableAtom = reloadable<
    { greeting: string } | { error: string },
    [boolean]
>(testApi, [false], { forceReload: true });
```

Enjoy!

## usage

### install jotai

( v1 is also supported, but strongly recomment jotai v2 since typescript on v1 is not working well.)

```js
npm i jotai@2
```

### import reloadable

```js
import { reloadable } from 'jotai-reloadable'; // instead of loadable, use reloadable from 'jotai-reloadable'
import { atom, createStore, useAtomValue } from 'jotai';
const myStore = createStore();
```

### define reloadable atom

```js
const valObj = { count: 0 };
const asyncFunc = (arg1: number, arg2: number) => {
    valObj.count++; // starting from 1
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (valObj.count % 3 === 0) resolve({ value: valObj.count });
            else
                reject({
                    errorText: 'error because valObj.count is ' + valObj.count,
                });
        }, 1000); //simulating service call.
    });
};
const reloadableAtom = reloadable(asyncFund, [1, 2]); // it will call asyncFunc(1,2) when reloadableAtom is created.
const derivedAtom = atom(get => {
    // the same way of loadable(atom(asyncFunc()))
    const ret = get(reloadableAtom);
    if (ret.state === 'hasData') {
        return ret.data;
    } else if (ret.state === 'hasError') {
        console.log('error happened:' + ret.error.errorText); // console.log will show ==> error happended: error because valObj.count is 1
    } else if (ret.loading) {
        console.log('loading...');
    }
    return null;
});
```

### use atom in your component

```js
export const MyComponent = () => {
    const val = useAtomValue(derivedAtom, { store: myStore });
    return <div>return value: {!!val && val.value}</div>;
};
```

### refresh as needed

```js
export const MyComponent = () => {
    return (
        <button
            onClick={() => {
                myStore.set(reloadableAtom, [1, 2]);
            }}
        >
            Reload
        </button>
    );
};
```

In above example, when count reaches at 3, reload will not work anymore. But you can force it to reload by using like below:

```js
export const MyComponent = () => {
    return (
        <button
            onClick={() => {
                myStore.set(reloadableAtom, {
                    args: [1, 2],
                    forceReload: true,
                });
            }}
        >
            Reload(force)
        </button>
    );
};
```

## Troubleshoot

#### if you are using jotai@1.X.X version

-   typescript shows wrong error for the arguments of set. Ignore it then it will still work.

```js
export const MyComponent = () => {
    return (
        <button
            onClick={() => {
                // @ts-ignore
                myStore.set(reloadableAtom, [1, 2]); // <-- typescript will complain in this line saying use [[1,2]] instead of [1,2]. ignore it ( add // @ts-ignore )
            }}
        >
            Reload
        </button>
    );
};

export const MyComponent = () => {
    return (
        <button
            onClick={() => {
                myStore.set(reloadableAtom, {
                    // <--- typescript complains of the type of action. it says wrap it with array, but that's not right.
                    args: [1, 2],
                    forceReload: true,
                });
            }}
        >
            Reload(force)
        </button>
    );
};
```

#### if you're using jotai@1.13.x version

when you import jotai, you should import useAtomValue and useSetAtom from 'jotai/react' instead of 'jotai'.
