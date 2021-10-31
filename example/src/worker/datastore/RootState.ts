import { Book } from '../../domain/book';

export interface RootState {
    books: Book[] | null;
}
