import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { exampleWorker } from '../worker/exampleClient';
import { doLoadDataRequest } from '../worker/messages';
import { BookList } from './BookList';
import { Filters } from './filters/Filters';
import { DataSize } from './DataSize';
import { RootState } from './RootState';
import { clearAllFilters } from './filters/filter.actions';

import styles from './app.css';

export const App = () => {
    const [dataLoaded, setDataLoaded] = React.useState(false);

    const dataSize = useSelector((state: RootState) => state.dataLoader.dataSize);

    const dispatch = useDispatch();

    React.useEffect(() => {
        setDataLoaded(false);
    }, [dataSize]);

    React.useEffect(() => {
        if (dataLoaded) {
            return () => {};
        }

        let mounted = true;
        // When the app starts up or the requested dataSize changes, load in some books
        (async () => {
            await exampleWorker(doLoadDataRequest(dataSize));
            if (mounted) {
                setDataLoaded(true);
            }
        })();

        // And reset the filters
        dispatch(clearAllFilters());

        return () => {
            mounted = false;
        };
    }, [dispatch, dataLoaded, dataSize]);

    return (
        <div className={styles.app}>
            <h1 className={styles.title}>cg-webworker example</h1>
            <DataSize className={styles.dataSize} />
            <Filters className={styles.filters} />
            {!dataLoaded && <div className={styles.results}>Loading books&hellip;</div>}
            {dataLoaded && <BookList className={styles.results} />}
        </div>
    );
};
