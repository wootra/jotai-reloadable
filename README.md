# jotai-reloadable

## limitation

this library is tested in jotai-v2. jotai-v1 is not supported anymore because of core difference.

## what jotai-reloadable can do?

- make loadable atom re-loadable easier
- retry given amount of count when promise fails
- replace function call (basic version: just argument of the function, simple version: whole function can be replaced)

## disclaimer

If you prefer to use jotai without using external library, try below:
relative discussion is here: (<https://github.com/pmndrs/jotai/discussions/1822>)

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

## Welcome to jotai-reloadable

jotai-reusable is a simple atom that can be re-run the promise.
it also support retry count that allows re-try when the promise fails.
it can be used for the service call that runs 1 time, but possibly fails.

```jsx
import {reloadable} from 'jotai-reloadable';
const fetchFunc = ... // a service call that returns a promise.
const reloadableAtom = reloadable(fetchFunc, 'arg1', 'arg2'); // make reloadable atom
reloadable.setRetryCount(2); // optional. it automatically retry when the service call fails. if it fails even after 2 more trial, the atom will have {state: 'hasError'} until retry it.
...
//assume you already have a store
store.set(reloadableAtom); // retry when it failed before. if succeeded before, does not reload
store.set(reloadableAtom, 'arg1-1', 'arg2-1'); // you can pass other argument. if argument is different, the fetch is restarted. 
store.set(reloadableAtom, FORCE_RELOAD); // retry fetch function even though the fetch function succeeded. argument is reused.
store.set(reloadableAtom, FORCE_RELOAD, 'arg1-2', 'arg2-2'); // you can change arguments of the fetch function when reloading.

```

below is more practical usage.

## Motivation

`loadable` in jotai library is not re-loadable since it is a read atom.
There is an approach that you use multiple atoms allowing you to "reset" the promise atom.
see this discussion (<https://github.com/pmndrs/jotai/discussions/1822>)
But I want to keep an atom to be one atom allowing it "reloadable"

below is a possible approach that simply re-run failed fetch call.

```jsx
import { loadable } from 'jotai/utils';
import { atom, createStore, useAtomValue } from 'jotai';

const countVal = { count: 0 };
const testApi = async (passOnCount: number) => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            countVal.count++;
            if (countVal.count === passOnCount) { // testApi will pass when it is called passOnCount times.
                res({ greeting: 'hello', countVal });
            } else {
                rej({ error: 'failed', countVal });
            }
        }, 1000);
    });
};

const baseAtom = atom(testApi(3)); // create an atom that holds a promise. in this example, this testApi will return rejected Promise
const loadableAtom = loadable(baseAtom); // this atom will hold Loadable object and return it when promise changes the state.
const finalAtom = atom(
  (get) => get(loadableAtom),
  (get, set) => {
    if (get(loadableAtom).state === 'hasError') { // this block will allow to retry of loadableAtom when the service call fails.
      set(baseAtom, testApi(3)); // in this example, testApi will pass when the button is clicked 2 more times. ( countVal.count === 3 )
    }
  }
); // with this atom, we can control baseAtom as well as getting current Loadable item from loadableAtom.
// while it is possible to get Loadable directly from lodableAtom, it is easier to have derieved atom with write ability.

const store = createStore();

const MyComponent = () => {
    const ret = useAtomValue(loadableAtom, { store }); // since testApi(3) will fail until it is called 2 more times, it will return { state: 'hasError', error: { error: 'failed', countVal: 1 }}
    // ret will be Loadable type (https://github.com/pmndrs/jotai/blob/c334628e3e50e54aa8d99cc28f6051078459a73e/src/vanilla/utils/loadable.ts#L8)
    return (<div>
        <pre>{JSON.stringify(ret)}</pre>
        <button onClick={()=>store.set(finalAtom)}>reload</button>
    </div>);
    // when reload button is clicked, the service call will be called again until the service passes.
};
```

Sometimes testApi is just unstable(in this example, when button is clicked 2 more times, it will pass). So if this component is reloaded, or if some action is given(i.e. button click or component reload), I want to reload the Loadable state from testApi.

Here is a simple way to reload the api call.

```jsx
import {reloadable} from 'jotai-reloadable'; // instead of loadable, use reloadable from 'jotai-reloadable'
import { atom, createStore, useAtomValue } from 'jotai';

...
const loadableAtom = reloadable(testApi, 5); // instead of using loadable, use reloadable and pass async function and its initial arguments(optional). Note it passes a function reference and arguments instead of its return Promise.
// in this scenario, testApi will pass when it is called 5 times.
loadableAtom.setRetryCount(2); // optional. it will automatically re-try testApi 2 more times when it fails.

const store = createStore();

const MyComponent = ()=> {
    const ret = useAtomValue(loadableAtom, {store});
    return <div>
       <pre>
        {JSON.stringify(ret)}
       </pre>
       <button onClick={()=>{store.set(loadableAtom)}}>reload</button>
    </div>
}
```

Now, we can "reload" the failed service call easily.
By `loadableAtom.setRetryCount(2)`, it will retry testApi automatically one more time.
If you click reload button, it will re call testApi 2 more times again. (total 4 times of testApi calls).
If you click reload button one more time, the `testApi` will finally pass, and it will not be called anymore since it is already passed.

## But.. I want to call testApi again even though it is passed

jotai-reloadable also allow you to force to run it again.
there is 2 ways to force reload regardless of state of data.

### set force-reload as default option

```jsx
import {reloadable} from 'jotai-reloadable';
const loadableAtom = reloadable(testApi, 5);
loadableAtom.setForceReload(true);
```

### reload with FORCE_RELOAD symbol

```jsx
import {reloadable} from 'jotai-reloadable';
import {FORCE_RELOAD} from 'jotai-reloadable/types';
const loadableAtom = reloadable(testApi, 1); // testApi will pass at the first trial.
...
<button
    onClick={() => {
        store.set(loadableAtom, FORCE_RELOAD); // even though testApi is already passed, it will 
    }}
>
    force reloading with the same arguments
</button>

<button
    onClick={() => {
        store.set(loadableAtom, FORCE_RELOAD, 3); // you can change argument when you force reload.
    }}
>
    make pass when 3rd click, and continue calling testApi
</button>

<button
    onClick={() => {
        store.set(loadableAtom, 5); // when the argument is changed from previous "set", it will restart process until testApi passes with the new arguments.
    }}
>
    make pass when 5rd click, but no more call after 5th call.
</button>

```

Enjoy!

## How to Install

### install jotai and jotai-reloadable

( v1 is NOT supported from 1.2 version. you should use jotai v2 version.)

```sh
npm i jotai@2
npm i jotai-reloadable
```
