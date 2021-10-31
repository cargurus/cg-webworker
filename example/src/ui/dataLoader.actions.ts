export const DataLoaderActionTypes = {
    SET_DATALOADER: 'DATALOADER/SET',
} as const;

export const setDataCount = (amount: number) => ({
    type: DataLoaderActionTypes.SET_DATALOADER,
    payload: {
        amount,
    },
});

export type DataLoaderActions = ReturnType<typeof setDataCount>;
