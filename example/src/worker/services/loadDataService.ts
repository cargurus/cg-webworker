import * as faker from 'faker';
import { generateBook } from '../../domain/generateBook';
import { doLoadDataRequest, doLoadDataResponse } from '../messages';
import { ExampleContext } from '../ExampleContext';
import { setData } from '../datastore/actions';

export const loadDataService = async (
    payload: ReturnType<typeof doLoadDataRequest>['payload'],
    ctx: ExampleContext
) => {
    // Lets say on average, an author writes 5 books
    const authorsTotal = Math.ceil(payload.count / 5);
    const authorList = new Array(authorsTotal);
    for (let i = 0; i < authorsTotal; i++) {
        authorList[i] = faker.name.findName();
    }

    // And each publisher has 50 books
    const publishersTotal = Math.ceil(payload.count / 50);
    const publishingCompanies = new Array(publishersTotal);
    for (let i = 0; i < publishersTotal; i++) {
        publishingCompanies[i] = faker.company.companyName();
    }

    const books = new Array(payload.count);
    for (let i = 0; i < payload.count; i++) {
        books[i] = generateBook(authorList, publishingCompanies);
    }
    ctx.dispatch(setData(books));

    return doLoadDataResponse();
};
