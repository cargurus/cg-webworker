import { Book } from './book';

export function filterByTitleContains(books: Book[], containsTitle: string) {
    return books.filter((b) => b.title.includes(containsTitle));
}
export function filterByContentsContains(books: Book[], contentsContains: string): Book[] {
    return books.filter((b) => b.contents.includes(contentsContains));
}
export function filterByAuthors(books: Book[], authors: string[]): Book[] {
    return books.filter((book) =>
        authors.some((author) => 0 === book.author.localeCompare(author, undefined, { sensitivity: 'base' }))
    );
}
export function filterByPublishers(books: Book[], publishers: string[]): Book[] {
    return books.filter((book) =>
        publishers.some(
            (publisher) => 0 === book.publisher.localeCompare(publisher, undefined, { sensitivity: 'base' })
        )
    );
}
export function fitlerByBookLength(books: Book[], { min, max }: { min?: number | null; max?: number | null }): Book[] {
    return books.filter((b) => (!min || b.contents.length >= min) && (!max || b.contents.length <= max));
}
export function fitlerByPublishDate(books: Book[], { min, max }: { min?: Date | null; max?: Date | null }): Book[] {
    return books.filter((b) => (!min || b.datePublished >= min) && (!max || b.datePublished <= max));
}
