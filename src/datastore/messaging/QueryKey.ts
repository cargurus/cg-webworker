export type QueryKey =
    | string
    | number
    | Date
    | null
    | undefined
    | boolean
    | (string | number | Date | null | undefined | boolean)[];
