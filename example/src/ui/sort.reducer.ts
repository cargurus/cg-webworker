import { Reducer } from 'redux';
import { SortDir, sortKeys } from '../domain/sortKeys';
import { SortActions, SortActionTypes } from './sort.actions';

export interface SortState {
    sortKey: typeof sortKeys[keyof typeof sortKeys];
    sortDir: SortDir;
}

const getDefaultState = (): SortState => ({
    sortKey: 'PUBLISH_DATE',
    sortDir: 'DESC',
});

export const sortReducer: Reducer<SortState, SortActions> = (
    state: SortState = getDefaultState(),
    action: SortActions
): SortState => {
    switch (action.type) {
        case SortActionTypes.SET_SORT: {
            return {
                sortKey: action.payload.sortKey,
                sortDir: action.payload.sortDir,
            };
        }
        default:
            return state;
    }
};
