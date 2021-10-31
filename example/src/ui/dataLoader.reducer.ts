import { Reducer } from 'redux';
import { DataLoaderActions, DataLoaderActionTypes } from './dataLoader.actions';

export interface DataLoaderState {
    dataSize: number;
}
const getDefaultState = (): DataLoaderState => ({ dataSize: 1000 });
export const dataLoaderReducer: Reducer<DataLoaderState, DataLoaderActions> = (
    state: DataLoaderState = getDefaultState(),
    action: DataLoaderActions
) => {
    switch (action.type) {
        case DataLoaderActionTypes.SET_DATALOADER:
            return {
                dataSize: action.payload.amount,
            };
        default:
            return state;
    }
};
