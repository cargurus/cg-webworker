import { SortDir, sortKeys } from '../domain/sortKeys';

export const SortActionTypes = {
    SET_SORT: 'SORT/SET',
} as const;

export const setSort = (sortKey: typeof sortKeys[keyof typeof sortKeys], sortDir: SortDir) => ({
    type: SortActionTypes.SET_SORT,
    payload: {
        sortKey,
        sortDir,
    },
});

export type SortActions = ReturnType<typeof setSort>;
