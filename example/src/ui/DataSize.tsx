import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDataCount } from './dataLoader.actions';
import { RootState } from './RootState';

interface DataSizeProps {
    className?: string;
}

export const DataSize = ({}: DataSizeProps) => {
    const dispatch = useDispatch();
    const dataSize = useSelector((state: RootState) => state.dataLoader.dataSize);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const newValue = ev.target.value ? ev.target.valueAsNumber : null;

            if (!newValue || newValue <= 0) {
                return;
            }

            dispatch(setDataCount(newValue));
        },
        [dispatch]
    );

    return (
        <div>
            <h2 id="ChangeDataSizeLabel">Number of records</h2>
            <input type="number" value={dataSize} min={1} onChange={onChange} aria-labelledby="ChangeDataSizeLabel" />
        </div>
    );
};
