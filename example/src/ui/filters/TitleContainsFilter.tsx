import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setTitleContains } from './filter.actions';

interface TitleContainsFilterProps {
    titleContains: string | null;
}
export const TitleContainsFilter = ({ titleContains }: TitleContainsFilterProps) => {
    const dispatch = useDispatch();
    const onTitleSearchChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            dispatch(setTitleContains(ev.target.value || null));
        },
        [dispatch]
    );

    return (
        <div>
            <h3>Search title</h3>
            <input type="text" value={titleContains || ''} onChange={onTitleSearchChange} />
        </div>
    );
};
