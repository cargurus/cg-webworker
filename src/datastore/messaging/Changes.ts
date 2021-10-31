/**
 * Map of SubscriberIds to newly changed result
 */

export type Changes = {
    data: ReadonlyMap<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    notify: string[];
};
