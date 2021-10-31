export const FilterActionTypes = {
    AUTHOR_ADD: 'FILTER/AUTHOR/ADD',
    AUTHOR_REMOVE: 'FILTER/AUTHOR/REMOVE',
    PUBLISHERS_ADD: 'FILTER/PUBLISHER/ADD',
    PUBLISHERS_REMOVE: 'FILTER/PUBLISHER/REMOVE',
    PUBLISH_DATES_SET: 'FILTER/PUBLISHDATES/SET',
    BOOK_LENGTHS_SET: 'FILTER/BOOKLENGTH/SET',
    TITLE_CONTAINS_SET: 'FILTER/TITLECONTAINS/SET',
    CONTENT_CONTAINS_SET: 'FILTER/CONTENTCONTAINS/SET',
    CLEAR_ALL: 'FILTER/CLEAR_ALL',
} as const;

export const addAuthor = (value: string) => ({ type: FilterActionTypes.AUTHOR_ADD, payload: { value } });
export const removeAuthor = (value: string) => ({ type: FilterActionTypes.AUTHOR_REMOVE, payload: { value } });
export const addPublisher = (value: string) => ({ type: FilterActionTypes.PUBLISHERS_ADD, payload: { value } });
export const removePublisher = (value: string) => ({ type: FilterActionTypes.PUBLISHERS_REMOVE, payload: { value } });
export const setPublishDates = (value: { min?: Date | null; max?: Date | null } | null) => ({
    type: FilterActionTypes.PUBLISH_DATES_SET,
    payload: { value },
});
export const setBookLengths = (value: { min?: number | null; max?: number | null } | null) => ({
    type: FilterActionTypes.BOOK_LENGTHS_SET,
    payload: { value },
});
export const setTitleContains = (value: string | null) => ({
    type: FilterActionTypes.TITLE_CONTAINS_SET,
    payload: { value },
});
export const setContentContains = (value: string | null) => ({
    type: FilterActionTypes.CONTENT_CONTAINS_SET,
    payload: { value },
});
export const clearAllFilters = () => ({ type: FilterActionTypes.CLEAR_ALL });

export type FilterActions =
    | ReturnType<typeof addAuthor>
    | ReturnType<typeof removeAuthor>
    | ReturnType<typeof addPublisher>
    | ReturnType<typeof removePublisher>
    | ReturnType<typeof setPublishDates>
    | ReturnType<typeof setBookLengths>
    | ReturnType<typeof setTitleContains>
    | ReturnType<typeof setContentContains>
    | ReturnType<typeof clearAllFilters>;
