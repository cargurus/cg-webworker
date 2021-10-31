import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setPublishDates } from './filter.actions';

interface PublishDateFilterProps {
    selectedMinDate: null | Date;
    selectedMaxDate: null | Date;
    bookCollectionMinDate: Date;
    bookCollectionMaxDate: Date;
}
export const PublishDateFilter = ({
    selectedMinDate,
    selectedMaxDate,
    bookCollectionMaxDate,
    bookCollectionMinDate,
}: PublishDateFilterProps) => {
    const dispatch = useDispatch();
    const onMinPublishDateChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const newValue = (ev.target.value && ev.target.valueAsDate) || undefined;
            dispatch(setPublishDates({ min: newValue, max: selectedMaxDate }));
        },
        [dispatch, selectedMaxDate]
    );

    const onMaxPublishDateChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const newValue = (ev.target.value && ev.target.valueAsDate) || undefined;
            dispatch(setPublishDates({ min: selectedMinDate, max: newValue }));
        },
        [dispatch, selectedMinDate]
    );

    return (
        <div>
            <h3>Publish date</h3>
            <div>
                <input
                    type="date"
                    value={(selectedMinDate || bookCollectionMinDate).toISOString().slice(0, 10)}
                    min={bookCollectionMinDate.toISOString().slice(0, 10)}
                    max={bookCollectionMaxDate.toISOString().slice(0, 10)}
                    onChange={onMinPublishDateChange}
                />
                to
                <input
                    type="date"
                    value={(selectedMaxDate || bookCollectionMaxDate).toISOString().slice(0, 10)}
                    min={bookCollectionMinDate.toISOString().slice(0, 10)}
                    max={bookCollectionMaxDate.toISOString().slice(0, 10)}
                    onChange={onMaxPublishDateChange}
                />
            </div>
        </div>
    );
};
