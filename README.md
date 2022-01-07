# CG-WebWorker
A little bit of sugar to make apps powered by webworkers more tolerable.

- [CG-WebWorker](#cg-webworker)
  - [Install](#install)
  - [Usage](#usage)
    - [Queries](#queries)
    - [QueryRegistry (TypeScript only; you can skip if just using JS)](#queryregistry-typescript-only-you-can-skip-if-just-using-js)
    - [WorkerContext (TypeScript only; you can skip if just using JS)](#workercontext-typescript-only-you-can-skip-if-just-using-js)
    - [Worker services](#worker-services)
    - [ServiceRegistry](#serviceregistry)
    - [The Worker Entry](#the-worker-entry)
    - [The Worker Client](#the-worker-client)
    - [Make the call!](#make-the-call)
    - [Webpack config](#webpack-config)
  - [Usage with a datastore (like Redux)](#usage-with-a-datastore-like-redux)
    - [Configuring](#configuring)
      - [Update context with datastore](#update-context-with-datastore)
      - [Update QueryRegistry to accept datastore messages](#update-queryregistry-to-accept-datastore-messages)
      - [Update ServiceRegistry to route datastore requests](#update-serviceregistry-to-route-datastore-requests)
      - [Setup your datastore as normal](#setup-your-datastore-as-normal)
      - [Wire the store into the worker during initialization](#wire-the-store-into-the-worker-during-initialization)
      - [Add a data client](#add-a-data-client)
    - [Make the call!](#make-the-call-1)
    - [Hooks to easily update React](#hooks-to-easily-update-react)
      - [React Batch Middleware setup](#react-batch-middleware-setup)
  - [Advanced Usage](#advanced-usage)
    - [Middleware](#middleware)
    - [Globals in your codebase](#globals-in-your-codebase)
    - [polyfills](#polyfills)
    - [Transferrables](#transferrables)
    - [Usage with IE11](#usage-with-ie11)

## Install
Use your favorite package manager to install the `cg-webworker` npm package. `yarn add cg-webworker` or `npm install cg-webworker`.

You'll also want some sort of build tool. I've only run this with Webpack 5, or Webpack 4 with [`worker-loader`](https://github.com/webpack-contrib/worker-loader), but there's no reason it wouldn't work with something that gives similar functionality.

## Usage
There's strong typings available on everything, but you can use regular JS if you like, too. The library is compatible with ES Modules and CommonJS/umd, and although I've only used it with Webpack builds, there's no reason it wouldn't work with your favorite build system. (I'd highly recommend using Typescript to get the autocomplete and strong-typing on request and response paylods, but you don't have to).

You'll setup a QueryRegistry and a ServiceRegistry, then configure your worker client and you're ready.

### Queries
Query request and response types are a simple shape, much like a redux action. We send a request to the worker, and it will send back a response.

```
import { createWorkerMessage } from 'cg-webworker/core';

// Queries.ts
export const QUERY_TYPES = {
    Example: 'EXAMPLE',
} as const;

export const exampleRequest = (someText: string) => createWorkerMessage({ type: QUERY_TYPES.Example, payload: { someText: someText } });

export const exampleResponse = (success: boolean) => createWorkerMessage({ type: QUERY_TYPES.Example, payload: { someValue: success }});
```

### QueryRegistry (TypeScript only; you can skip if just using JS)
The QueryRegistry is to match request types to response types, to make sure you're returning the right types. 

```
// ExampleQueryRegistry.ts
import type { WorkerQuery } from 'cg-webworker/core';
import type {
    exampleRequest,
    exampleResponse,
    QUERY_TYPES,
} from './Queries';

export interface ExampleQueryRegistry {
    [QUERY_TYPES.Example]: WorkerQuery<typeof exampleRequest, typeof exampleResponse>;
}
```

### WorkerContext (TypeScript only; you can skip if just using JS)
The WorkerContext can be extended to carry all your persistent state. It might be empty if you've got no need of that. Often, it is used to give access to a datastore, like Redux ([more on that below](#usage-with-a-datastore-like-redux)).

```
// ExampleContext.ts
import type { BaseContext } from 'cg-webworker/core';
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

export type ExampleContext = { logger: (textToLog: string) => void } & BaseContext<ExampleQueryRegistry>;
```

### Worker services
Worker services are functions that take a request payload and the worker context as parameters, and return a response; or throw an error if you like - the worker client will receive the exception and raise it to the calling component, triggering your catch block or promise.catch() callback.
```
import { exampleRequest, exampleResponse } from './Queries';
import { ExampleContext } from './ExampleContext';

// exampleService.ts
export const exampleService = async (
    payload: ReturnType<typeof exampleRequest>['payload'],
    ctx: ExampleContext
): Promise<typeof exampleResponse> => {
    ctx.logger(payload.someText); // This will log to the WebWorker's console

    return exampleResponse(true);
}
```

### ServiceRegistry
The ServiceRegistry matches request types to the function that you'll be calling. Easy.
```
// ExampleServiceRegistry.ts
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';
import type { ExampleContext } from './ExampleContext';
import type { QUERY_TYPES } from './Queries';
import { exampleService } from './exampleService';

export const ExampleServiceRegistry: ServiceRegistry<ExampleQueryRegistry, ExampleContext> = {
    [QUERY_TYPES.Example]: exampleService,
} as const;
```

### The Worker Entry
Now we create the webworker-side of the connection, an entrypoint that will setup the message listener, and coordinate service calls. The function to setup a worker callbroker takes several parameters:
* a context factory,
* an async service registry import function,
* and an initialization function, to setup any dependencies you have.

The most important part is the service registry import, particularly if you have a well established codebase. Using the webpack eager import (or whatever mechanism you use that provides similar functionality) will mean that your codebase's module-scoped code isn't executed until the import occurs, which lets us run the initialization function, to setup any dependencies first. The most common scenario is files using globals from the window, which won't exist in the worker thread until we create them.
```
// ExampleWorker.worker.ts
import { setupWorkerCallBroker, WebWorker } from 'cg-webworker/core';
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';
import type { ExampleContext } from './ExampleContext';
import type { ExampleServiceRegistry } from './services/ExampleServiceRegistry';

const thisWorker = self as unknown as WebWorker<ExampleQueryRegistry>;
// tsconfig doesn't like mixing WebWorker and DOM code, so we have to cast to unknown first (see https://github.com/microsoft/TypeScript/issues/20595).

setupWorkerCallBroker<ExampleQueryRegistry, ExampleContext, typeof ExampleServiceRegistry, {}>(
    thisWorker,
    // Context factory
    (worker, workerState) => {
        return {
            worker,
            workerState,
            logger: console.log,
        };
    },
    // Service registry import
    async () => {
        return {
            serviceRegistry: await import(/* webpackMode: "eager" */ './ExampleServiceRegistry').then(
                (mod) => mod.ExampleServiceRegistry
            ),
            onError: (ex: Error) => console.error(ex),
        };
    },
    // Setup dependencies
    (config, onSuccess) => {
        console.log('Being served from ' + config.origin);
        console.log('Received config data:', config.data);
        onSuccess();
    }
);
```

### The Worker Client
The other side of the worker connection is the Worker Client. We create a provider, so that there is just one instance of the worker created.
```
// exampleClient.ts
import {
    workerProvider,
    clientCallBroker,
    AllRequestsOf,
    WorkerClient,
    messageDebuggingMiddleware,
} from 'cg-webworker/core';

import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

// This import will be transformed by webpack and worker-loader
// @ts-ignore
import ExampleWorkerReference from './ExampleWorker.worker';

export const exampleClient = <TRequest extends AllRequestsOf<ExampleQueryRegistry>>(request: TRequest) => {
    const worker = workerProvider(
            'ExampleWorker',
            () => new ExampleWorkerReference() as WorkerClient,
            () => ({}),     // Empty config
            [messageDebuggingMiddleware]
        );
    return clientCallBroker<ExampleQueryRegistry, TRequest>(worker, request);
};
```

### Make the call!
```
// Some file
import { exampleClient } from './exampleClient';
import { exampleRequest } from './Queries';

export async function somethingUseful() {
    const result = await exampleClient(exampleRequest('Write this to the worker'));
    console.log(result.someValue);
}
```

### Webpack config
Use a convention to recognize your worker entry file as something to use worker-loader on. I use the file segment ".worker." to help.
```
// webpack.config.js

module.exports = {
    // ... other config
    module: {
        rules: [
            // ... other rules
            {
                test: /\.worker\.(ts|js)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'worker-loader',
                        options: {
                            filename: '[name].worker.js',
                            esModule: false,
                            publicPath: '/',
                        },
                    },
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
            // ... other rules
        ]
    },
    // ... other config
}
```

## Usage with a datastore (like Redux)
If the hole point of this is to build an application inside a worker, chances are you'll be wanting a datastore as well. Being able to subscribe to changes in the datastore would be good, too, maybe updating a React component with the new info, for example. Note that you don't need to use Redux, it can be anything, so long as you link up the datastore subscriber.

You can use the cg-webworker/datastore library to easily do this.

### Configuring
You'll just need to declare our state, then update your context, ServiceRegistry, and some simple initialization.

#### Update context with datastore
```
// ExampleContext.ts
import type { BaseContext } from 'cg-webworker/core';
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

// We'll declare RootState and RootAction later

export type ExampleContext = {
    logger: (textToLog: string) => void;
    readonly dispatch: Dispatch<RootAction>; // Store dispatch prop that services can call
}
    & BaseContext<ExampleQueryRegistry>
    & DatastoreContext<RootState>;  // Our context now has props to help manage datastore subscribers etc.
```
#### Update QueryRegistry to accept datastore messages
```
import type { WorkerQuery } from 'cg-webworker/core';
import type { DatastoreQueryRegistry } from 'cg-webworker/datastore';
import type {
    exampleRequest,
    exampleResponse,
    QUERY_TYPES,
} from './Queries';

// Simply extend the DatastoreQueryRegistry
export interface ExampleQueryRegistry extends DatastoreQueryRegistry {
    [QUERY_TYPES.Example]: WorkerQuery<typeof exampleRequest, typeof exampleResponse>;
}
```
#### Update ServiceRegistry to route datastore requests
```
// ExampleServiceRegistry.ts
import { DatastoreServiceRegistry } from 'cg-webworker/datastore';
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';
import type { ExampleContext } from './ExampleContext';
import type { QUERY_TYPES } from './Queries';
import { exampleService } from './exampleService';

export const ExampleServiceRegistry: ServiceRegistry<ExampleQueryRegistry, ExampleContext> = {
    [QUERY_TYPES.Example]: exampleService,
    ...DatastoreServiceRegistry, // All our datastore requests are now mapped
} as const;
```

#### Setup your datastore as normal
Setup your datastore the way you noramlly would. For redux, we'll declare the rootstate, some actions, and a reducer.
**State**
```
// RootState.ts
export interface RootState {
    lastMessage: string | null;
    logTimes: Date[];
}
```
**Actions**
```
// actions.ts
export const ACTION_TYPES = {
    SET_LAST_MESSAGE: 'LAST_MESSAGE/SET',
    ADD_LOG_TIME: 'LOG_TIME/ADD',
} as const;
export const setLastMessage = (message: string) => ({ type: ACTION_TYPES.SET_LAST_MESSAGE, payload: { message } });
export const addLogTime = (logTime: Date) => ({ type: ACTION_TYPES.ADD_LOG_TIME, payload: { logTime } });

export type RootAction = ReturnType<typeof setLastMessage> | ReturnType<typeof addLogTime>;
```
**Reducer**
```
// rootReducer.ts
import { RootAction, ACTION_TYPES } from './actions';
import { RootState } from './RootState';

const getDefaultRootState = (): RootState => ({ lastMessage: null, logTimes: [] });

export const rootReducer = (state: RootState = getDefaultRootState(), action: RootAction) => {
    switch (action.type) {
        case ACTION_TYPES.SET_LAST_MESSAGE: {
            return {
                ...state,
                lastMessage: action.payload.message,
            };
        }
        case ACTION_TYPES.ADD_LOG_TIME: {
            const newTimes = state.logTimes.slice();
            newTimes.push(action.payload.logTime);
            return {
                ...state,
                lastMessage: newTimes,
            };
        }
        default:
            return state;
    }
};
```
#### Wire the store into the worker during initialization
```
// ExampleWorker.worker.ts
import { createStore } from 'redux';
import { setupWorkerCallBroker, WebWorker } from 'cg-webworker/core';
import { initializeDatastore } from 'cg-webworker/datastore';

import type { ExampleQueryRegistry } from './ExampleQueryRegistry';
import type { ExampleContext } from './ExampleContext';
import type { ExampleServiceRegistry } from './services/ExampleServiceRegistry';
import { rootReducer } from './datastore/rootReducer';


const thisWorker = self as unknown as WebWorker<ExampleQueryRegistry>;
// tsconfig doesn't like mixing WebWorker and DOM code, so we have to cast to unknown first (see https://github.com/microsoft/TypeScript/issues/20595).

setupWorkerCallBroker<ExampleQueryRegistry, ExampleContext, typeof ExampleServiceRegistry, {}>(
    thisWorker,
    // Context factory
    (worker, workerState) => {
        // Initialize our redux store
        const reduxStore = createStore(rootReducer);

        const ctx: ExampleContext = {
            worker,
            workerState,
            logger: console.log,

            // Add our datastore props to the context
            dispatch: reduxStore.dispatch,
            datastore: initializeDatastore(
                () => ctx, // Datastore subscribers need a context getter ...
                () => reduxStore.getState()  // ... and a way to get the root state.
            ),
        };

        // Wire up the redux store to the subscribers
        reduxStore.subscribe(() => {
            ctx.datastore.handleStoreChanges();
        });
        return ctx;
    },
    // Service registry import
    async () => {
        return {
            serviceRegistry: await import(/* webpackMode: "eager" */ './ExampleServiceRegistry').then(
                (mod) => mod.ExampleServiceRegistry
            ),
            onError: (ex: Error) => console.error(ex),
        };
    },
    // Setup dependencies
    (config, onSuccess) => {
        console.log('Being served from ' + config.origin);
        console.log('Received config data:', config.data);
        onSuccess();
    }
);
```

#### Add a data client
Our initial worker client handles the normal request + response style behaviour, but we need another client to listen for the changes and continue to give notifications.
```
// exampleClient.ts
import {
    workerProvider,
    clientCallBroker,
    AllRequestsOf,
    WorkerClient,
    messageDebuggingMiddleware,
} from 'cg-webworker/core';

import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

// This import will be transformed by webpack and worker-loader
// @ts-ignore
import ExampleWorkerReference from './ExampleWorker.worker';

const worker = workerProvider(
    'ExampleWorker',
    () => new ExampleWorkerReference() as WorkerClient,
    () => ({}),     // Empty config
    [messageDebuggingMiddleware]
);

export const exampleClient = <TRequest extends AllRequestsOf<ExampleQueryRegistry>>(request: TRequest) => {
    return clientCallBroker<ExampleQueryRegistry, TRequest>(worker, request);
};
export const exampleSubscribeClient = createSubscribeCallBroker<ExampleQueryRegistry>(worker);
```

### Make the call!
Use prop names to query into the datastore.

```
// Some file
import { exampleClient, exampleSubscribeClient } from './exampleClient';
import { exampleRequest } from './Queries';

export async function somethingUseful() {
    const result = await exampleClient(exampleRequest('Write this to the worker'));
    console.log(result.someValue);
}

export function doSomethingWhenDataChanges() {
    // Receive the latest data, whenever it changes:
    const unsubFromData = exampleSubscribeClient.onData(['lastMessage'], (data) => {
        console.log("last message received was: " + data);
    });

    // Or, listen for when some data changes, then perform an action
    const unsubFromListening = exampleSubscribeClient.onChange(['logTimes'], () => {
        console.log("logTimes was updated.");
    });

    setTimeout(() => {
        // You can unsubscribe when you're done.
        unsubFromData();
        unsubFromListening();
    }, 10000);
}
```

### Hooks to easily update React
For ease of setup, there are hooks to update React components, and a middleware to apply the updates in batch.
```
// SomeComponent.tsx
import * as React from 'react';
import { useSubscribeChange, useSubscribeData } from 'cg-webworker/react';
import { exampleSubscribeClient } from '../../worker/exampleClient';

export const SomeComponent = () => {
    const lastMessage = useSubscribeData(['lastMessage'], exampleSubscribeClient); // lastMessage is updated whenever data comes in

    useSubscribeChange(
        () => {
            // logTimes was updated. Do something...
        },
        [],
        ['logTimes'],
        exampleSubscribeClient
    );

    return (
        <div>
            Last message: {lastMessage}
        </div>
    );
};
```

#### React Batch Middleware setup
Apply same as any middleware when setting up the datastore client:
```
// exampleClient.ts
import {
    workerProvider,
    clientCallBroker,
    AllRequestsOf,
    WorkerClient,
    messageDebuggingMiddleware,
} from 'cg-webworker/core';
import { ReactBatchMiddleware } from 'cg-webworker/react'; // <--- **this**

import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

// This import will be transformed by webpack and worker-loader
// @ts-ignore
import ExampleWorkerReference from './ExampleWorker.worker';

const worker = workerProvider(
    'ExampleWorker',
    () => new ExampleWorkerReference() as WorkerClient,
    () => ({}),     // Empty config
    [messageDebuggingMiddleware]
);

export const exampleClient = <TRequest extends AllRequestsOf<ExampleQueryRegistry>>(request: TRequest) => {
    return clientCallBroker<ExampleQueryRegistry, TRequest>(worker, request);
};
export const exampleSubscribeClient = createSubscribeCallBroker<ExampleQueryRegistry>(worker, [
    ReactBatchMiddleware, // <--- **here**
]);
```

## Advanced Usage

### Middleware
Middlewares can process messages on both sides of the worker connection. 

### Globals in your codebase
Use dependency setup function and config action to patch the globals.

### polyfills
Add as first import to worker entry point.

### Transferrables
First-class support, via createWorkerMessage.

### Usage with IE11
Use the legacy libs. eg. `cg-webworker/core-legacy`

