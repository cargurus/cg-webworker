/* eslint-disable no-console */
import * as React from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import { BookInfo } from '../domain/book';
import { exampleWorker } from '../worker/exampleClient';
import { doSortAndFilterRequest } from '../worker/messages';
import { BookListItem } from './BookListItem';
import { RootState } from './RootState';

import styles from './BookList.css';

interface BookListProps {
    className?: string | string[];
}
export const BookList = ({ className }: BookListProps) => {
    const [books, setBooks] = React.useState<null | BookInfo[]>(null);
    const [totalBooksMatchingFilters, setTotalMatchingFilters] = React.useState<null | number>(null);
    const [bookContentsById, setBookContentsById] = React.useState<null | Map<string, ArrayBuffer>>(null);

    const activeFilters = useSelector((state: RootState) => state.filters);
    const sort = useSelector((state: RootState) => state.sort);

    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize] = React.useState(15);

    React.useEffect(() => {
        let mounted = true;
        setBooks(null);
        setTotalMatchingFilters(null);

        (async () => {
            const { results, totalResults, bookContentsById } = await exampleWorker(
                doSortAndFilterRequest(
                    {
                        authors: activeFilters.authors || undefined,
                        bookLength: activeFilters.bookLength || undefined,
                        contentsContains: activeFilters.contentContains || undefined,
                        publishDates: activeFilters.publishDates || undefined,
                        publishers: activeFilters.publishers || undefined,
                        titleContains: activeFilters.titleContains || undefined,
                    },
                    {
                        key: sort.sortKey,
                        dir: sort.sortDir,
                    },
                    pageIndex,
                    pageSize
                )
            );

            if (mounted) {
                setBooks(results);
                setTotalMatchingFilters(totalResults);
                setBookContentsById(bookContentsById);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [activeFilters, sort, pageIndex, pageSize]);

    const lastPage = totalBooksMatchingFilters && Math.floor(totalBooksMatchingFilters / pageSize);

    React.useLayoutEffect(() => {
        if (lastPage == null) {
            return;
        }
        if (lastPage < pageIndex) {
            setPageIndex(lastPage);
        }
    }, [pageIndex, lastPage]);

    const onFirstClick = React.useCallback(() => {
        setPageIndex(0);
    }, []);
    const onLastClick = React.useCallback(() => {
        if (lastPage == null) {
            return;
        }
        setPageIndex(lastPage);
    }, [lastPage]);
    const onNextClick = React.useCallback(() => {
        setPageIndex((prev) => prev + 1);
    }, []);
    const onPreviousClick = React.useCallback(() => {
        setPageIndex((prev) => prev - 1);
    }, []);

    if (books == null) {
        return <div className={clsx(className)}>Processing&hellip;</div>;
    }

    return (
        <div className={clsx(className)}>
            <div className={styles.pagingContainer}>
                <button type="button" onClick={onFirstClick} disabled={pageIndex === 0}>
                    First
                </button>
                <button type="button" onClick={onPreviousClick} disabled={pageIndex === 0}>
                    Previous
                </button>
                <span>
                    Page: {pageIndex + 1} of {(lastPage || 0) + 1}
                </span>
                <button type="button" onClick={onNextClick} disabled={pageIndex === lastPage}>
                    Next
                </button>
                <button type="button" onClick={onLastClick} disabled={pageIndex === lastPage}>
                    Last
                </button>
            </div>
            <ul className={clsx(styles.bookList)}>
                {books.map((b) => (
                    <BookListItem book={b} key={b.id} contents={bookContentsById?.get(b.id) || null} />
                ))}
            </ul>
            <div className={styles.pagingContainer}>
                <button type="button" onClick={onFirstClick} disabled={pageIndex === 0}>
                    First
                </button>
                <button type="button" onClick={onPreviousClick} disabled={pageIndex === 0}>
                    Previous
                </button>
                <span>
                    Page: {pageIndex + 1} of {(lastPage || 0) + 1}
                </span>
                <button type="button" onClick={onNextClick} disabled={pageIndex === lastPage}>
                    Next
                </button>
                <button type="button" onClick={onLastClick} disabled={pageIndex === lastPage}>
                    Last
                </button>
            </div>
        </div>
    );
};
