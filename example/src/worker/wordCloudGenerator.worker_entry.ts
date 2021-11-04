import './applyPolyfills';
import type { Book } from '../domain/book';
import d3Cloud, { Word } from './d3-cloud';

self.onmessage = (
    ev: MessageEvent<{
        canvas: OffscreenCanvas;
        book: Book;
        width: number;
        height: number;
        maxWords: number;
        minWordLength: number;
        minWordPlotSize: number;
        maxWordPlotSize: number;
    }>
) => {
    const { canvas, book, width, height, maxWordPlotSize, maxWords, minWordLength, minWordPlotSize } = ev.data;

    const allWords = book.contents.split(/[^A-Za-z0-9]/);
    const wordsCount = new Map<string, number>();
    allWords.forEach((w) => {
        if (w.length < minWordLength) {
            return;
        }
        const current = wordsCount.get(w);
        if (current) {
            wordsCount.set(w, current + 1);
        } else {
            wordsCount.set(w, 1);
        }
    });

    const topWords = Array.from(wordsCount.entries())
        .sort(([aWord, aCount], [bWord, bCount]) => (aCount === bCount ? bWord.length - aWord.length : bCount - aCount))
        .slice(0, maxWords);
    const maxWordCount: number = topWords[0][1];
    const wordsToPlot = topWords.map(
        ([word, wordCount]) =>
            ({
                text: word,
                size: minWordPlotSize + (wordCount / maxWordCount) * (maxWordPlotSize - minWordPlotSize),
            } as Word)
    );

    const result = d3Cloud<Word>()
        .canvas(() => new OffscreenCanvas(width, height))
        .size([width / 2, height / 2])
        .words(wordsToPlot)
        // .padding(5)
        // .rotate(function () {
        //     return ~~(Math.random() * 2) * 90;
        // })
        .font('Impact')
        .fontSize(function (d: Word) {
            return d.size as number;
        })
        .generate();

    const scale = result.bounds
        ? Math.min(
              width / Math.abs(result.bounds[1].x - width / 2),
              width / Math.abs(result.bounds[0].x - width / 2),
              height / Math.abs(result.bounds[1].y - height / 2),
              height / Math.abs(result.bounds[0].y - height / 2)
          ) / 2
        : 1;
    const e = canvas.getContext('2d')!;
    result.tags.forEach(function (t) {
        const textColor = '#000';
        e.save();
        e.translate(0.25 * width + t.x * scale, 0.25 * height + t.y * scale);
        e.rotate((t.rotate * Math.PI) / 180);
        e.textAlign = 'center';
        e.fillStyle = textColor;
        e.font = t.size * scale + 'px ' + t.font;
        e.fillText(t.text, 0, 0);
        e.restore();
    });

    (self as unknown as Worker).postMessage('done');
};
