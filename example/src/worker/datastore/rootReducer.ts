import { RootAction, ACTION_TYPES } from './actions';
import { RootState } from './RootState';

const getDefaultRootState = (): RootState => ({ books: null });

export const rootReducer = (state: RootState = getDefaultRootState(), action: RootAction) => {
    switch (action.type) {
        case ACTION_TYPES.SET_DATA: {
            return {
                ...state,
                books: action.payload.data,
            };
        }
        default:
            return state;
    }
};
