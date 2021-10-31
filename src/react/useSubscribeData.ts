import * as React from 'react';
import type { SubscribeCallBroker, QueryKey } from 'cg-webworker/datastore';
import { checkQueryKeyEquality } from './checkQueryKeyEquality';
import { cloneQuery } from './cloneQuery';

export const useSubscribeData = <TResult>(
    query: QueryKey[],
    subscriberCallBroker: SubscribeCallBroker
): TResult | undefined => {
    const alreadyRun = React.useRef(false);
    const previousStatePathRef = React.useRef<QueryKey[] | undefined>(undefined);
    const [subscriberDataState, setSubscriberDataState] = React.useState<undefined | TResult>(undefined);

    const statePath: QueryKey[] = React.useMemo(
        () => {
            if (alreadyRun.current && checkQueryKeyEquality(previousStatePathRef.current, query)) {
                return previousStatePathRef.current as unknown as QueryKey[];
            }

            alreadyRun.current = true;
            previousStatePathRef.current = cloneQuery(query);

            return previousStatePathRef.current;
        },
        query // eslint-disable-line react-hooks/exhaustive-deps
    );

    React.useEffect(() => {
        let isMounted = true;
        const unsub = subscriberCallBroker.onData(statePath, (data: TResult) => {
            if (isMounted) {
                setSubscriberDataState(data);
            }
        });

        return () => {
            isMounted = false;
            unsub();
        };
    }, [subscriberCallBroker, statePath]);

    return subscriberDataState;
};
