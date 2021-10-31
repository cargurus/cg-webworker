import * as React from 'react';
import { useDispatch } from 'react-redux';
import { addAuthor, removeAuthor } from './filter.actions';

interface AuthorsFilterProps {
    authors: Map<string, number>;
    selectedAuthors: null | string[];
}
export const AuthorsFilter = ({ authors, selectedAuthors }: AuthorsFilterProps) => {
    const dispatch = useDispatch();

    const [expandAuthors, setExpandAuthors] = React.useState(false);

    const authorsList = React.useMemo(
        () =>
            Array.from(authors.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([authorName, numberBooks]) => ({
                    authorName,
                    numberBooks,
                    checked: selectedAuthors?.includes(authorName) || false,
                })),
        [authors, selectedAuthors]
    );

    const onAuthorToggle: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (ev) => {
            const authorName = ev.target.value;

            if (ev.target.checked) {
                dispatch(addAuthor(authorName));
            } else if (!ev.target.checked) {
                dispatch(removeAuthor(authorName));
            }
        },
        [dispatch]
    );

    return (
        <div>
            <h3>
                Author{' '}
                <button type="button" onClick={() => setExpandAuthors((prev) => !prev)}>
                    {expandAuthors ? 'Show less' : 'Show more'}
                </button>
            </h3>
            <ul>
                {(expandAuthors ? authorsList : authorsList.slice(0, 15)).map(
                    ({ authorName, numberBooks, checked }) => (
                        <li key={authorName}>
                            <label>
                                {authorName} ({numberBooks}){' '}
                                <input type="checkbox" value={authorName} checked={checked} onChange={onAuthorToggle} />
                            </label>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
};
