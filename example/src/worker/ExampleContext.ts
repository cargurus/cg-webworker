import type { Dispatch } from 'redux';
import type { DatastoreContext } from 'cg-webworker/datastore';
import type { BaseContext } from 'cg-webworker/core';
import type { RootState } from './datastore/RootState';
import type { RootAction } from './datastore/actions';
import type { ExampleQueryRegistry } from './ExampleQueryRegistry';

export type ExampleContext = {
    readonly dispatch: Dispatch<RootAction>;
} & BaseContext<ExampleQueryRegistry> &
    DatastoreContext<RootState>;
