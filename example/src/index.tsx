import * as React from 'react';
import * as ReactDom from 'react-dom';
import { createStore, compose } from 'redux';
import { Provider } from 'react-redux';

import { App } from './ui/app';
import { rootReducer } from './ui/rootReducer';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
        _sva: {
            traits: {
                [traitName: string]: string;
            };
        };
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers());

ReactDom.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
