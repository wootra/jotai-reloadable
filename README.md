# jotai-reloadable

## limitation

this library is tested in jotai-v2. jotai-v1 has an issue that fails.
you can still use it in jotai-v1, but typescript has bug in the jotai v1 core, so you should use jsx or // @ts-ignore in the tsx file

## disclaimer

when you don't want to reload jotai loadable object multiple times and the case is limited,
using a pure jotai / loadable object could be the best practice. (<https://github.com/pmndrs/jotai/discussions/1822>)
If you're a slave of the lazyness, you might want to use simpleReloadable that is almost identical of the simple code.

```jsx
const fetchFunc = ...
const baseAtom = atom(fetchFunc())
const loadableAtom = loadable(baseAtom)
const finalAtom = atom(
  (get) => get(loadableAtom),
  (get, set) => {
    if (get(loadableAtom).state === 'hasError') {
      set(baseAtom, fetchFunc())
    }
  }
)
```

```jsx
import {simpleReloadable as reloadable} from 'jotai-reloadable';
const fetchFunc = ...
const reloadableAtom = reloadable(fetchFunc);
...
//assume you already have a store
store.set(reloadableAtom); // retry when it failed before. if succeeded before, does not reload
store.set(reloadableAtom, fetchFunc); // same meaning of above line. when the function reference is the same, does not retry.
store.set(reloadableAtom, ()=>fetchFunc()); // retry the service call no matter what. simpleReloadable check the reference to know if this function is a new function or not.
```

below is more advanced usage, but I believe simpleReloadable will work for most of times.

## Motivation

loadable in jotai library is not re-loadable. I wanted to make it run again, but didn't have much luck except for the way of making multiple atoms manually.

```jsx
import { loadable } from 'jotai/utils';
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

const baseAtom = atom(testApi(false)); // create an atom that holds a promise. in this example, this testApi will return rejected Promise
const loadableAtom = loadable(baseAtom); // this atom will hold Loadable object and return it when promise changes the state.
const finalAtom = atom(
  (get) => get(loadableAtom),
  (get, set) => {
    if (get(loadableAtom).state === 'hasError') { // this block will allow to retry of loadableAtom when the service call fails.
      set(baseAtom, testApi(true)); // in this example, testApi will pass when button is clicked.
    }
  }
); // with this atom, we can control baseAtom as well as getting current Loadable item from loadableAtom.
// while it is possible to get Loadable directly from lodableAtom, it is easier to have derieved atom with write ability.

const store = createStore();

const MyComponent = () => {
    const ret = useAtomValue(loadableAtom, { store }); // since testApi(false) will return fail value, it will be always return { state: 'hasError', error: {...}}
    return (<div>
        <pre>{JSON.stringify(ret)}</pre>
        <button onClick={()=>store.set(finalAtom)}>reload</button>
    </div>);
    // when reload button is clicked, the service call will be called again until the service passes.
};
```

Sometimes testApi is just unstable. So if this component is reloaded, or if some action is given(i.e. button click or component reload), I want to reload the value from testApi. In above example, we can do it.
But wouldn't it be better to have 'reloadable' util like 'loadable' util, so we don't need to create multiple atoms?

Here is a simple way to reload the api call.

```jsx
import {reloadable} from 'jotai-reloadable'; // instead of loadable, use reloadable from 'jotai-reloadable'
import { atom, createStore, useAtomValue } from 'jotai';

const countVal = { count: 0 }; // to check if the service call is duplicated.
const testApi = async (pass: boolean) => {...};

const loadableAtom = reloadable(testApi, [false]); // instead of using loadable, use reloadable and pass async function and its initial argument(optional)

const store = createStore();

const MyComponent = ()=> {
    const ret = useAtomValue(loadableAtom, {store}); // since testApi(false) will return fail value, it will be always return { state: 'hasError', error: {...}}
    return <div>
       <pre>
        {JSON.stringify(ret)}
       </pre>
       <button onClick={()=>{store.set(loadableAtom, [true])}}>reload</button>
    </div>
}
```

Now, we can "reload" the failed service call. Note [true] is passed as the arguments of the testApi function.

Also, you will see loadableAtom is not updated once loadable success. (state == 'hasData').

But sometimes, we need to "force" to call the service once more.

Then we can pass option to force reload.

```jsx
<button
    onClick={() => {
        store.set(loadableAtom, {
            args: [true],
            options: { forceReload: true },
        });
    }}
>
    reload
</button>
```

You also can set the reload option as a default function by adding the option when you setup the atom.

```jsx
type ReturnValue = { greeting: string } | { error: string };
type Arguments = [boolean];
const loadableAtom = reloadable<ReturnValue,Arguments>(testApi, [false], { forceReload: true });
```

if you want to automatically retry few times when the service is failed, you can set the retry count:

```jsx
const loadableAtom = reloadable<ReturnValue,Arguments>(testApi, [false], { retry: 3 });
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
// if you want to use simple version of reloadable
// import {simpleReloadable as reloadable } from 'jotai-reloadable';
import { atom, createStore, useAtomValue } from 'jotai';
const myStore = createStore();
```

### define reloadable atom

```jsx
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
// for simpleReloadable, it will look like this (simpleReloadable does not receive arguments):
// const reloadableAtom = reloadable(async ()=> await asyncFunc(1,2));
const derivedAtom = atom((get)=>{
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

```jsx
export const MyComponent = () => {
    const val = useAtomValue(derivedAtom, { store: myStore });
    return <div>return value: {!!val && val.value}</div>;
};
```

### refresh as needed

```jsx
export const MyComponent = () => {
    return (
        <button
            onClick={() => {
                myStore.set(reloadableAtom);
                // just retry without argument. once passes, does not do anything. (same in simpleReloadable)
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
                // for simpleReloadable, you should pass a new function reference to force reload
                // myStore.set(reloadableAtom, async ()=>await asyncFunc(1,2))
            }}
        >
            Reload(force)
        </button>
    );
};
```

## Troubleshoot

### if you are using jotai@1.X.X version

- typescript shows wrong error for the arguments of set. Ignore it then it will still work.

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

### if you're using jotai@1.13.x version

when you import jotai, you should import useAtomValue and useSetAtom from 'jotai/react' instead of 'jotai'.
