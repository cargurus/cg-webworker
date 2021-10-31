beforeAll(() => {
    page.on('console', (msg) => {
        // eslint-disable-next-line no-console
        console[msg.type()](msg.text(), msg.location());
    });
});
