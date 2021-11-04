beforeAll(() => {
    page.on('console', (msg) => {
        let messageType = msg.type();
        switch (messageType) {
            case 'log':
            case 'info':
            case 'error':
            case 'warn':
                break;
            default:
                messageType = 'log';
                break;
        }
        // eslint-disable-next-line no-console
        console[messageType](msg.text(), msg.location());
    });
});
