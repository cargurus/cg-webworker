export function* streamString(encodedTextBuffer: ArrayBuffer, bufferSize: number = 10240) {
    if (encodedTextBuffer.byteLength === 0) {
        return;
    }

    const decoder = new TextDecoder('utf-8');
    let current = 0;
    while (encodedTextBuffer.byteLength - current > 0) {
        const willNeedMore = encodedTextBuffer.byteLength - current - bufferSize > 0;

        if (!willNeedMore) {
            yield decoder.decode(encodedTextBuffer.slice(current), { stream: false });
            return;
        }

        yield decoder.decode(encodedTextBuffer.slice(current, current + bufferSize - 1), {
            stream: true,
        });

        current += bufferSize;
    }
    return;
}
