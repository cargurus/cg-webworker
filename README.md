# CG-WebWorker
A little bit of sugar to make apps powered by webworkers more tolerable.

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
Use a convention to recognize your worker entry file as something to use worker-loader on. I use the file segment `.worker.` to help.
```
// webpack.config.js

module.exports = {
    // ... lots of config
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
    // ... lots of config
}

```

## Usage with a datastore (like Redux)
### Configuring
### Subscribing to updates (in a React component, or elsewhere)

## Advanced Usage
### Middleware
### Globals in your codebase
### polyfills
### transferrables
### Usage with IE11

