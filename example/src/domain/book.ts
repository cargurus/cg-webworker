export interface Book {
    id: string;
    title: string;
    author: string;
    datePublished: Date;
    publisher: string;
    contents: string;
    image: string;
}
export interface BookInfo {
    id: string;
    title: string;
    author: string;
    datePublished: Date;
    publisher: string;
    contentsLength: number;
    image: string;
}
