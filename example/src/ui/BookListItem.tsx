import * as React from 'react';
import { exampleWorker } from '../worker/exampleClient';
import { wordCloudGenerateRequest } from '../worker/messages';
import { BookInfo } from '../domain/book';

import styles from './BookListItem.css';

interface BookListItemProps {
    book: BookInfo;
    contents: ArrayBuffer | null;
}
export const BookListItem = ({ book }: BookListItemProps) => {
    const wordCloudEnabled = 'OffscreenCanvas' in window;
    const [showWordCloud, setShowWordCloud] = React.useState(false);
    const [isDrawingWordCloud, setIsDrawingWordCloud] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const onToggleWordCloudClicked = React.useCallback(() => {
        setShowWordCloud((prev) => !prev);
    }, []);

    const bookId = book.id;

    React.useLayoutEffect(() => {
        if (!wordCloudEnabled || !showWordCloud || !canvasRef.current) {
            return () => {};
        }
        let mounted = true;
        setIsDrawingWordCloud(true);
        exampleWorker(
            wordCloudGenerateRequest(
                canvasRef.current.transferControlToOffscreen(),
                bookId,
                canvasRef.current.clientWidth,
                canvasRef.current.clientHeight,
                100,
                3,
                8,
                30
            )
        )
            .then(() => {
                if (mounted) {
                    setIsDrawingWordCloud(false);
                }
            })
            .catch((ex: Error) => {
                setIsDrawingWordCloud(false);
                // eslint-disable-next-line no-console
                console.error(ex);
            });
        return () => {
            mounted = false;
        };
    }, [showWordCloud, bookId, wordCloudEnabled]);

    return (
        <li className={styles.bookListItem}>
            <h3 className={styles.title}>{book.title}</h3>
            <div className={styles.infoContainer}>
                <span className={styles.label}>Author: </span>
                <span className={styles.field}>{book.author}</span>
                <span className={styles.label}>Publisher: </span>
                <span className={styles.field}>{book.publisher}</span>
                <span className={styles.label}>Publish date: </span>
                <span className={styles.field}>{book.datePublished.toLocaleDateString()}</span>
                <span className={styles.label}>Book length: </span>
                <span className={styles.field}>{book.contentsLength}</span>
                {wordCloudEnabled && (
                    <>
                        <span className={styles.label}>Word cloud: </span>
                        <span className={styles.field}>
                            <button type="button" onClick={onToggleWordCloudClicked}>
                                {showWordCloud ? 'Hide word cloud' : 'Show word cloud'}
                            </button>
                        </span>
                    </>
                )}
            </div>
            {book.image ? (
                <img
                    className={styles.coverImage}
                    src={book.image}
                    alt="Book cover"
                    width="197"
                    height="147"
                    loading="lazy"
                />
            ) : (
                <span>No cover image available</span>
            )}
            {showWordCloud && (
                <div className={styles.wordCloudContainer}>
                    {isDrawingWordCloud && <span>Loading&hellip;</span>}
                    <canvas id={`wordcloud|${book.id}`} className={styles.wordCloudCanvas} ref={canvasRef}></canvas>
                </div>
            )}
        </li>
    );
};
