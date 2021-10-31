import * as React from 'react';
import { useDispatch } from 'react-redux';
import { addPublisher, removePublisher } from './filter.actions';

interface PublishersFilterProps {
    publishers: Map<string, number>;
    selectedPublishers: null | string[];
}
export const PublishersFilter = ({ publishers, selectedPublishers }: PublishersFilterProps) => {
    const dispatch = useDispatch();
    const [expandPublishers, setExpandPublishers] = React.useState(false);

    const publishersList = React.useMemo(
        () =>
            Array.from(publishers.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([publisherName, numberBooks]) => ({
                    publisherName,
                    numberBooks,
                    checked: selectedPublishers?.includes(publisherName) || false,
                })),
        [publishers, selectedPublishers]
    );

    const onPublisherToggle: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const publisherName = ev.target.value;

            if (ev.target.checked) {
                dispatch(addPublisher(publisherName));
            } else if (!ev.target.checked) {
                dispatch(removePublisher(publisherName));
            }
        },
        [dispatch]
    );

    return (
        <div>
            <h3>
                Publisher{' '}
                <button type="button" onClick={() => setExpandPublishers((prev) => !prev)}>
                    {expandPublishers ? 'Show less' : 'Show more'}
                </button>
            </h3>
            <ul>
                {(expandPublishers ? publishersList : publishersList.slice(0, 15)).map(
                    ({ publisherName, numberBooks, checked }) => (
                        <li key={publisherName}>
                            <label>
                                {publisherName} ({numberBooks}){' '}
                                <input
                                    type="checkbox"
                                    value={publisherName}
                                    checked={checked}
                                    onChange={onPublisherToggle}
                                />
                            </label>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
};
