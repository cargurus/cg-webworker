import * as faker from 'faker';
import { Book } from './book';

export const generateBook = (authorList: string[], publisherList: string[]): Book => ({
    id: faker.unique(faker.random.alphaNumeric, [10]),
    title: faker.lorem.sentence(),
    author: authorList[Math.floor(Math.random() * (authorList.length - 1))],
    contents: faker.lorem.paragraphs(50 + Math.ceil(Math.random() * 150)),
    datePublished: faker.date.past(),
    image: faker.image.imageUrl(640, 480, undefined, true, true),
    publisher: publisherList[Math.floor(Math.random() * (publisherList.length - 1))],
});
