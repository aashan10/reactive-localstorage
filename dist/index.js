"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalStorageStore = exports.createMemo = exports.createEffect = exports.createSignal = exports.watch = void 0;
function initialize() {
    // The context is a stack of subscribers. The top of the stack is the currently running subscriber.
    let context = [];
    // A signal is a pair of a getter and a setter.
    function createSignal(value) {
        let data = value;
        let subscriptions = new Set();
        const get = () => {
            const running = context[context.length - 1];
            if (running) {
                subscribe(running, subscriptions);
            }
            return data;
        };
        const set = (value) => {
            data = value;
            for (const subscription of [...subscriptions]) {
                subscription.execute();
            }
        };
        return [get, set];
    }
    // A subscriber is added to the dependencies of the currently running subscriber.
    function subscribe(running, subscriptions) {
        subscriptions.add(running);
        running.dependencies.add(subscriptions);
    }
    // Currently running subscriber is removed from the dependencies of all subscribers.
    // Also, all subscribers are removed from the dependencies of the currently running subscriber.
    function cleanup(running) {
        for (const dep of running.dependencies) {
            dep.delete(running);
        }
        running.dependencies.clear();
    }
    // An effect is a function that is executed when a signal changes.
    function createEffect(callback) {
        const execute = () => {
            cleanup(running);
            context.push(running);
            try {
                return callback();
            }
            finally {
                context.pop();
            }
        };
        const running = {
            dependencies: new Set(),
            execute
        };
        return execute();
    }
    // A memo is a signal that is only updated when its dependencies change.
    function createMemo(fn) {
        const [get, set] = createSignal(fn());
        createEffect(() => set(fn()));
        return get;
    }
    return {
        createSignal,
        createEffect,
        createMemo
    };
}
const { createSignal, createEffect, createMemo } = initialize();
exports.createSignal = createSignal;
exports.createEffect = createEffect;
exports.createMemo = createMemo;
const watch = (callback) => {
    createEffect(callback);
};
exports.watch = watch;
const createLocalStorageStore = (name, initialValue) => {
    let item = window.localStorage.getItem(name);
    let existing;
    if (item !== null) {
        try {
            existing = JSON.parse(item);
        }
        catch (e) {
            existing = initialValue;
        }
    }
    else {
        existing = initialValue;
    }
    const [store, setStore] = createSignal(existing);
    createEffect(() => {
        window.localStorage.setItem(name, JSON.stringify(store()));
    });
    window.addEventListener('storage', (event) => {
        const { key } = event;
        if (key !== name) {
            return;
        }
        const { newValue, oldValue } = event;
        if (!newValue) {
            setStore(initialValue);
            return;
        }
        if (newValue !== oldValue) {
            setStore(JSON.parse(newValue));
        }
    });
    return [store, setStore];
};
exports.createLocalStorageStore = createLocalStorageStore;
