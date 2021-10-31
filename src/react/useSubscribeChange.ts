import * as React from 'react';
import type { SubscribeCallBroker, QueryKey } from 'cg-webworker/datastore';
import { checkQueryKeyEquality } from './checkQueryKeyEquality';
import { cloneQuery } from './cloneQuery';

export const useSubscribeChange = (
    callback: () => void,
    dependencies: React.DependencyList,
    query: QueryKey[],
    subscriberCallBroker: SubscribeCallBroker
): void => {
    const alreadyRun = React.useRef(false);
    const previousStatePathRef = React.useRef<QueryKey[] | undefined>(undefined);

    const statePath: QueryKey[] = React.useMemo(
        () => {
            if (alreadyRun.current && checkQueryKeyEquality(previousStatePathRef.current, query)) {
                return previousStatePathRef.current as unknown as QueryKey[];
            }

            previousStatePathRef.current = cloneQuery(query);

            return previousStatePathRef.current;
        },
        query // eslint-disable-line react-hooks/exhaustive-deps
    );

    const onChangeCallback = React.useCallback(callback, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        const unsub = subscriberCallBroker.onChange(statePath, () => {
            onChangeCallback();
        });

        return () => {
            unsub();
        };
    }, [subscriberCallBroker, statePath, onChangeCallback]);

    React.useEffect(() => {
        alreadyRun.current = true;
    }, []);

    return;
};
