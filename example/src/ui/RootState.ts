import { DataLoaderState } from './dataLoader.reducer';
import { FilterState } from './filters/filter.reducer';
import { SortState } from './sort.reducer';

export interface RootState {
    filters: FilterState;
    sort: SortState;
    dataLoader: DataLoaderState;
}
