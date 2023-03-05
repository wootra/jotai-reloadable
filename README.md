# jotai-reloadable

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
