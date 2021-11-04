import * as React from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { useSubscribeChange } from 'cg-webworker/react';
import { exampleDatastore, exampleWorker } from '../../worker/exampleClient';
import { getBookCollectionInfoRequest } from '../../worker/messages';
import { RootState } from '../RootState';
import { SortToggle } from '../SortToggle';
import { AuthorsFilter } from './AuthorsFilter';
import { PublishersFilter } from './PublishersFilter';
import { PublishDateFilter } from './PublishDateFilter';
import { BookLengthFilter } from './BookLengthFilter';
import { ContentContainsFilter } from './ContentContainsFilter';
import { TitleContainsFilter } from './TitleContainsFilter';

import styles from './Filters.css';

interface FiltersProps {
    className?: string | string[];
}
export const Filters = ({ className }: FiltersProps) => {
    const [bookCollectionInfo, setBookCollectionInfo] = React.useState<null | {
        authors: Map<string, number>;
        publishers: Map<string, number>;
        bookLengths: { min: number; max: number };
        publishDates: { min: Date; max: Date };
    }>(null);

    const dataSize = useSelector((state: RootState) => state.dataLoader.dataSize);

    // Whenever the number of results is chaged, we need to clear old data
    React.useLayoutEffect(() => {
        setBookCollectionInfo(null);
    }, [dataSize]);

    useSubscribeChange(
        () => {
            let mounted = true;
            (async () => {
                // When the books data changes, re-query the filter info
                const result = await exampleWorker(getBookCollectionInfoRequest());
                if (!mounted) {
                    return;
                }

                if (result.ready) {
                    const { authors, publishers, bookLengths, publishDates } = result;
                    setBookCollectionInfo({
                        authors,
                        publishers,
                        bookLengths,
                        publishDates,
                    });
                } else {
                    setBookCollectionInfo(null);
                }
            })();
            return () => {
                mounted = false;
            };
        },
        [],
        ['books'],
        exampleDatastore
    );

    const filters = useSelector((state: RootState) => state.filters);

    if (!bookCollectionInfo) {
        return <div className={clsx(className)}>Loading book collection info&hellip;</div>;
    }

    return (
        <div className={clsx(className, styles.filters)}>
            <h2>Sort</h2>
            <SortToggle />
            <h2>Filters</h2>
            <TitleContainsFilter titleContains={filters.titleContains || null} />
            <ContentContainsFilter contentContains={filters.contentContains || null} />
            <AuthorsFilter authors={bookCollectionInfo?.authors} selectedAuthors={filters?.authors || null} />
            <PublishersFilter
                publishers={bookCollectionInfo.publishers}
                selectedPublishers={filters?.publishers || null}
            />
            <PublishDateFilter
                selectedMinDate={filters.publishDates?.min || null}
                selectedMaxDate={filters.publishDates?.max || null}
                bookCollectionMinDate={bookCollectionInfo.publishDates.min}
                bookCollectionMaxDate={bookCollectionInfo.publishDates.max}
            />
            <BookLengthFilter
                min={filters?.bookLength?.min || null}
                max={filters?.bookLength?.max || null}
                bookCollectionMin={bookCollectionInfo.bookLengths.min}
                bookCollectionMax={bookCollectionInfo.bookLengths.max}
            />
        </div>
    );
};
