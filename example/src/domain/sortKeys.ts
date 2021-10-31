export const sortKeys = {
    byAuthor: 'AUTHOR',
    byPublisher: 'PUBLISHER',
    byPublishDate: 'PUBLISH_DATE',
    byTitle: 'TITLE',
    byContentsLength: 'LENGTH',
} as const;

export type SortDir = 'ASC' | 'DESC';
