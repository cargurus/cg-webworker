import { Book } from './book';
import { SortDir } from './sortKeys';

export function sortBooks(
    sort: { key: 'AUTHOR' | 'PUBLISHER' | 'PUBLISH_DATE' | 'TITLE' | 'LENGTH'; dir: SortDir },
    books: Book[]
): Book[] {
    switch (sort.key) {
        case 'AUTHOR': {
            const result = books.sort((a, b) => a.author.localeCompare(b.author));
            return sort.dir === 'ASC' ? result : result.reverse();
        }
        case 'LENGTH': {
            const result = books.sort((a, b) => a.contents.length - b.contents.length);
            return sort.dir === 'ASC' ? result : result.reverse();
        }
        case 'PUBLISHER': {
            const result = books.sort((a, b) => a.publisher.localeCompare(b.publisher));
            return sort.dir === 'ASC' ? result : result.reverse();
        }
        case 'TITLE': {
            const result = books.sort((a, b) => a.title.localeCompare(b.title));
            return sort.dir === 'ASC' ? result : result.reverse();
        }
        case 'PUBLISH_DATE': {
            const result = books.sort((a, b) => a.datePublished.getTime() - b.datePublished.getTime());
            return sort.dir === 'ASC' ? result : result.reverse();
        }
        default:
            return books;
    }
}
