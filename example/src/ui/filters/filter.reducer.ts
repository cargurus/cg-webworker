import { Reducer } from 'redux';
import { FilterActions, FilterActionTypes } from './filter.actions';

export interface FilterState {
    readonly authors?: string[] | null;
    readonly publishers?: string[] | null;
    readonly publishDates?: { min?: Date | null; max?: Date | null } | null;
    readonly bookLength?: { min?: number | null; max?: number | null } | null;
    readonly titleContains?: string | null;
    readonly contentContains?: string | null;
}

const getDefaultState = (): FilterState => ({});
export const filterReducer: Reducer<FilterState, FilterActions> = (
    state: FilterState = getDefaultState(),
    action: FilterActions
): FilterState => {
    switch (action.type) {
        case FilterActionTypes.AUTHOR_ADD: {
            const newAuthor = action.payload.value;
            if (state.authors?.includes(newAuthor)) {
                return state;
            }
            return {
                ...state,
                authors: [newAuthor].concat(state.authors || []),
            };
        }
        case FilterActionTypes.AUTHOR_REMOVE: {
            if (!state.authors) return state;

            const indexOfAuthor = state.authors.indexOf(action.payload.value);
            if (indexOfAuthor === -1) {
                return state;
            }
            if (state.authors.length === 1) {
                return {
                    ...state,
                    authors: null,
                };
            }
            const newState = state.authors.slice(0, indexOfAuthor).concat(state.authors.slice(indexOfAuthor + 1));
            return {
                ...state,
                authors: newState,
            };
        }
        case FilterActionTypes.PUBLISHERS_ADD: {
            if (state.publishers?.includes(action.payload.value)) {
                return state;
            }
            return {
                ...state,
                publishers: [action.payload.value].concat(state.publishers || []),
            };
        }
        case FilterActionTypes.PUBLISHERS_REMOVE: {
            if (!state.publishers) return state;

            const indexOfPublisher = state.publishers.indexOf(action.payload.value);
            if (indexOfPublisher === -1) {
                return state;
            }
            if (state.publishers.length === 1) {
                return {
                    ...state,
                    publishers: null,
                };
            }
            const newState = state.publishers
                .slice(0, indexOfPublisher)
                .concat(state.publishers.slice(indexOfPublisher + 1));
            return {
                ...state,
                publishers: newState,
            };
        }
        case FilterActionTypes.BOOK_LENGTHS_SET: {
            return {
                ...state,
                bookLength: action.payload.value || null,
            };
        }
        case FilterActionTypes.PUBLISH_DATES_SET: {
            return {
                ...state,
                publishDates: action.payload.value || null,
            };
        }
        case FilterActionTypes.TITLE_CONTAINS_SET: {
            return {
                ...state,
                titleContains: action.payload.value || null,
            };
        }
        case FilterActionTypes.CONTENT_CONTAINS_SET: {
            return {
                ...state,
                contentContains: action.payload.value || null,
            };
        }
        case FilterActionTypes.CLEAR_ALL: {
            return getDefaultState();
        }
        default:
            return state;
    }
};
