/**
 * create a cancelable promise. when cancel is called, the promise will be resolved with the given value.
 * or it fails when timeout is reached.
 *
 * @param aPromise
 * @param timeout if 0, no timeout.
 * @returns
 */
export function cancelable<T>(aPromise: Promise<T>, timeout: number = 5000) {
    let cancel;
    const cancelPromise = new Promise<T>((res, rej) => {
        cancel = (ret: T | Error) => {
            if (ret instanceof Error) return rej(ret);
            else res(ret);
        };
        if (timeout > 0) {
            setTimeout(
                () => rej(new Error('cancelable timeout:' + timeout)),
                timeout
            );
        }
    });
    const cancelablePromise = Object.assign(
        Promise.race([aPromise, cancelPromise]),
        { cancel }
    );
    return cancelablePromise;
}
