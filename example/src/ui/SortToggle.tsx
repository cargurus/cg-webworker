import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SortDir, sortKeys } from '../domain/sortKeys';
import { RootState } from './RootState';
import { setSort } from './sort.actions';

import styles from './SortToggle.css';

export const SortToggle = () => {
    const dispatch = useDispatch();
    const { sortDir, sortKey } = useSelector((state: RootState) => state.sort);
    const selectedSortValue = `${sortKey}|${sortDir}`;

    const onSortChange: React.ChangeEventHandler<HTMLSelectElement> = React.useCallback(
        (ev) => {
            if (!ev.target.value) {
                return;
            }
            const [newSortKey, newSortDir] = ev.target.value.split('|');
            dispatch(setSort(newSortKey as typeof sortKeys[keyof typeof sortKeys], newSortDir as SortDir));
        },
        [dispatch]
    );

    return (
        <select
            className={styles.dropdown}
            value={selectedSortValue}
            onChange={onSortChange}
            aria-label="Change sort type and direction"
        >
            <option value="AUTHOR|ASC">Author ASC</option>
            <option value="AUTHOR|DESC">Author DESC</option>
            <option value="PUBLISHER|ASC">Publisher ASC</option>
            <option value="PUBLISHER|DESC">Publisher DESC</option>
            <option value="PUBLISH_DATE|ASC">Publish date ASC</option>
            <option value="PUBLISH_DATE|DESC">Publish date DESC</option>
            <option value="LENGTH|ASC">Book length ASC</option>
            <option value="LENGTH|DESC">Book length DESC</option>
            <option value="TITLE|ASC">Title ASC</option>
            <option value="TITLE|DESC">Title DESC</option>
        </select>
    );
};
