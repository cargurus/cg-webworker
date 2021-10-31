import { Book } from '../../domain/book';

export const ACTION_TYPES = {
    SET_DATA: 'DATA/SET/ALL',
} as const;
export const setData = (data: Book[]) => ({ type: ACTION_TYPES.SET_DATA, payload: { data } });

export type RootAction = ReturnType<typeof setData>;
