import type { Book } from '../../domain/book';
import { ExampleContext } from '../ExampleContext';
import { ExampleQueryRegistry } from '../ExampleQueryRegistry';
import { wordCloudGenerateResponse } from '../messages';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import WordCloudGeneratorWorkerRefererence from '../wordCloudGenerator.worker_entry';

export const generateWordCloud = function generateWordCloud(
    canvas: OffscreenCanvas,
    book: Book,
    width: number,
    height: number,
    maxWords: number,
    minWordLength: number = 3,
    minWordPlotSize: number = 10,
    maxWordPlotSize: number = 100
): Promise<void> {
    // Lets offload this intense work to a special built worker
    const worker: Worker = new WordCloudGeneratorWorkerRefererence();
    return new Promise<void>((resolve, reject) => {
        worker.onmessage = () => {
            worker.terminate();
            resolve();
        };
        worker.onerror = (ex) => {
            reject(ex);
        };
        worker.postMessage(
            {
                canvas,
                book,
                width,
                height,
                maxWords,
                minWordLength,
                minWordPlotSize,
                maxWordPlotSize,
            },
            [canvas]
        );
    });
};

export const generateWordCloudService = async (
    {
        canvas,
        bookId,
        width,
        height,
        maxWords,
        minWordLength,
        minWordPlotSize,
        maxWordPlotSize,
    }: ExampleQueryRegistry['BOOK/WORD_CLOUD/GENERATE']['request']['payload'],
    ctx: ExampleContext
): Promise<ExampleQueryRegistry['BOOK/WORD_CLOUD/GENERATE']['response']> => {
    const book = ctx.datastore.getRootState().books?.find((b) => b.id === bookId);
    if (!book) {
        throw new Error(`Book not found with id: '${bookId}'.`);
    }

    await generateWordCloud(canvas, book, width, height, maxWords, minWordLength, minWordPlotSize, maxWordPlotSize);

    return wordCloudGenerateResponse();
};
