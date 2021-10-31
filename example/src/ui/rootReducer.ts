import { combineReducers, Reducer } from 'redux';
import { DataLoaderActions } from './dataLoader.actions';
import { dataLoaderReducer } from './dataLoader.reducer';
import { FilterActions } from './filters/filter.actions';
import { filterReducer } from './filters/filter.reducer';
import { RootState } from './RootState';
import { SortActions } from './sort.actions';
import { sortReducer } from './sort.reducer';

export type RootAction = FilterActions | SortActions | DataLoaderActions;

export const rootReducer: Reducer<RootState, RootAction> = combineReducers<RootState>({
    filters: filterReducer,
    sort: sortReducer,
    dataLoader: dataLoaderReducer,
});
