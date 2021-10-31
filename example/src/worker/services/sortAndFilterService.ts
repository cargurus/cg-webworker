import { ExampleContext } from '../ExampleContext';
import { doSortAndFilterRequest, doSortAndFilterResponse } from '../messages';
import {
    filterByTitleContains,
    filterByContentsContains,
    filterByAuthors,
    filterByPublishers,
    fitlerByBookLength,
    fitlerByPublishDate,
} from '../../domain/filterBooks';
import { sortBooks } from '../../domain/sortBooks';

export const sortAndFilterService = async (
    { filter, pageIndex, pageSize, sort }: ReturnType<typeof doSortAndFilterRequest>['payload'],
    ctx: ExampleContext
) => {
    let result = ctx.datastore.getRootState().books;

    if (!result) {
        throw new Error('No data loaded.');
    }

    if (filter) {
        if (filter.titleContains) result = filterByTitleContains(result, filter.titleContains);
        if (filter.contentsContains) result = filterByContentsContains(result, filter.contentsContains);
        if (filter.authors) result = filterByAuthors(result, filter.authors);
        if (filter.publishers) result = filterByPublishers(result, filter.publishers);
        if (filter.bookLength) result = fitlerByBookLength(result, filter.bookLength);
        if (filter.publishDates) result = fitlerByPublishDate(result, filter.publishDates);
    }

    const totalResults = result.length;

    result = sortBooks(sort, result);

    result = result.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

    const bookContentsById: Map<string, ArrayBuffer> = new Map<string, ArrayBuffer>();
    result.forEach((b) => {
        const textEncoder = new TextEncoder();
        bookContentsById.set(b.id, textEncoder.encode(b.contents).buffer);
    });

    return doSortAndFilterResponse(
        result.map((b) => ({
            id: b.id,
            title: b.title,
            publisher: b.publisher,
            datePublished: b.datePublished,
            image: b.image,
            author: b.author,
            contentsLength: b.contents.length,
        })),
        totalResults,
        bookContentsById
    );
};
