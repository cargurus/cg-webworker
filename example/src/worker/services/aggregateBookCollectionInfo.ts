import { ExampleContext } from '../ExampleContext';
import { getBookCollectionInfoRequest, getBookCollectionInfoResponse } from '../messages';

export const aggregateBookCollectionInfo = async (
    request: ReturnType<typeof getBookCollectionInfoRequest>['payload'],
    ctx: ExampleContext
): Promise<ReturnType<typeof getBookCollectionInfoResponse>> => {
    const books = ctx.datastore.getRootState().books;
    if (books == null || books.length === 0) return getBookCollectionInfoResponse(null);

    const authors = new Map<string, number>();
    const publishers = new Map<string, number>();
    const bookLengths = { min: books[0].contents.length, max: books[0].contents.length };
    const publishDates = { min: books[0].datePublished, max: books[0].datePublished };

    books.forEach((b) => {
        authors.set(b.author, 1 + (authors.get(b.author) || 0));
        publishers.set(b.publisher, 1 + (publishers.get(b.publisher) || 0));
        if (b.datePublished < publishDates.min) {
            publishDates.min = b.datePublished;
        } else if (b.datePublished > publishDates.max) {
            publishDates.max = b.datePublished;
        }
        if (b.contents.length < bookLengths.min) {
            bookLengths.min = b.contents.length;
        } else if (b.contents.length > bookLengths.max) {
            bookLengths.max = b.contents.length;
        }
    });

    return getBookCollectionInfoResponse({ authors, publishers, bookLengths, publishDates, total: books.length });
};
