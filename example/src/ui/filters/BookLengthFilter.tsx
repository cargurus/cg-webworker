import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setBookLengths } from './filter.actions';

interface BookLengthFilterProps {
    min: null | number;
    max: null | number;
    bookCollectionMin: number;
    bookCollectionMax: number;
}
export const BookLengthFilter = ({ min, max, bookCollectionMin, bookCollectionMax }: BookLengthFilterProps) => {
    const dispatch = useDispatch();
    const onMinLengthChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const newValue = ev.target.value ? ev.target.valueAsNumber : undefined;
            dispatch(setBookLengths({ min: newValue, max: max }));
        },
        [dispatch, max]
    );

    const onMaxLengthChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const newValue = ev.target.value ? ev.target.valueAsNumber : undefined;
            dispatch(setBookLengths({ min: min, max: newValue }));
        },
        [dispatch, min]
    );

    return (
        <div>
            <h3>Book length</h3>
            <div>
                <input
                    type="number"
                    value={min || bookCollectionMin}
                    min={bookCollectionMin}
                    max={bookCollectionMax}
                    onChange={onMinLengthChange}
                />
                to
                <input
                    type="number"
                    value={max || bookCollectionMax}
                    min={bookCollectionMin}
                    max={bookCollectionMax}
                    onChange={onMaxLengthChange}
                />
            </div>
        </div>
    );
};
