import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setContentContains } from './filter.actions';

interface ContentContainsFilterProps {
    contentContains: string | null;
}
export const ContentContainsFilter = ({ contentContains }: ContentContainsFilterProps) => {
    const dispatch = useDispatch();
    const onContentSearchChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            dispatch(setContentContains(ev.target.value || null));
        },
        [dispatch]
    );

    return (
        <div>
            <h3>Search contents</h3>
            <input type="text" value={contentContains || ''} onChange={onContentSearchChange} />
        </div>
    );
};
