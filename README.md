## Reactive Local Storage

This package aims to provide primitives for handling local storage in a modern way.

### Features
- Create a persistant application state for any javascript application of the browser.
- Type safe local storage.
- Subscribe for changes in local storage items
- Integration with any frontend framework (it's just plain javascript)

### Usage
To store an item in local storage, you'll need to use the `createLocalStorageStore` method provided by the package.

Example:

```typescript

import { createLocalStorageStore, watch } from 'reactive-localstorage';

type User = {
    id: number,
    username: string,
}

const [user, setUser] = createLocalStorageStore<User>('user_storage'); // The user is getter function and setUser is setter function

```

To watch for the changes, you can use the code below

```typescript

watch(() => {                   // ---|     This function will be called 
    console.log(user());        //    |---- every time the 'user_storage' key
});                             // ---|     in localStorage changes

```

Note: The getter `user` must be called inside of the watch callback to be executed when the localStorage item `user_storage` changes.

## Example
To run example, navigate inside the examples directory and run `npm run dev`
