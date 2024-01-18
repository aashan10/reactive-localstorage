function initialize() {

    // A subscriber is a function that is executed when a signal changes.
    type Subscriber<T> = {
        dependencies: Set<Set<Subscriber<T>>>
        execute: () => T
    }

    // The context is a stack of subscribers. The top of the stack is the currently running subscriber.
    let context: Array<Subscriber<any>> = [];


    // A signal is a pair of a getter and a setter.
    function createSignal<T>(value: T): [() => T, (value: T) => void] {
        let data = value;
        let subscriptions: Set<Subscriber<T>> = new Set();

        const get = (): T => {
            const running = context[context.length - 1];
            if (running) {
                subscribe(running, subscriptions);
            }

            return data;
        };
        const set = (value: T) => {
            data = value;

            for (const subscription of [...subscriptions]) {
                subscription.execute();
            }
        }

        return [get, set];
    }

    // A subscriber is added to the dependencies of the currently running subscriber.
    function subscribe<T>(running: Subscriber<T>, subscriptions: Set<Subscriber<T>>) {
        subscriptions.add(running);
        running.dependencies.add(subscriptions);
    }

    // Currently running subscriber is removed from the dependencies of all subscribers.
    // Also, all subscribers are removed from the dependencies of the currently running subscriber.
    function cleanup<T>(running: Subscriber<T>) {
        for (const dep of running.dependencies) {
            dep.delete(running);
        }
        running.dependencies.clear();
    }
    
    // An effect is a function that is executed when a signal changes.
    function createEffect<T>(callback: () => T): T {
        const execute = () => {
            cleanup(running);
            context.push(running);
            try {
                return callback();
            } finally {
                context.pop();
            }
        }
    
        const running: Subscriber<T> = {
            dependencies: new Set(),
            execute
        }
    
        return execute();
    }

    // A memo is a signal that is only updated when its dependencies change.
    function createMemo<T>(fn: () => T) {
        const [get, set] = createSignal<T>(fn());
        createEffect(() => set(fn()));
        return get;
    }


    return {
        createSignal,
        createEffect,
        createMemo
    }

}

const {createSignal, createEffect, createMemo} = initialize();

export const watch = (callback: () => void) => {
    createEffect(callback);
}

export {createSignal, createEffect, createMemo};
export const createLocalStorageStore = <T>(name: string, initialValue: T): [() => T, (v: T) => void] => {

    let item = window.localStorage.getItem(name);
    let existing: T;
    if (item !== null) {
        try {
            existing = JSON.parse(item) as T;
        } catch (e) {
            existing = initialValue;
        }
    } else {
        existing = initialValue;
    }
    const [store, setStore] = createSignal<T>(existing);

    createEffect(() => {
        window.localStorage.setItem(name, JSON.stringify(store()));
    });

    window.addEventListener('storage', (event) => {
        const {key} = event;

        if (key !== name) {
            return;
        }

        const {newValue, oldValue} = event;

        if (!newValue) {
            setStore(initialValue);
            return;
        }
        if (newValue !== oldValue) {
            setStore(JSON.parse(newValue));
        }
    });

    return [store, setStore];
}
