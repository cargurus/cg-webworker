describe('simple app', () => {
    beforeEach(async () => {
        await page.goto(`http://${process.env.HOST_NAME}:${process.env.HOST_PORT}/simple.html`, { waitUntil: 'load' });
    });

    it('should be able to display a round-trip message from the worker', async () => {
        await page.waitForTimeout(100);
        expect(page.workers().length).toEqual(1);
        const resultEle = await page.$('#result');
        const innerTextHandle = await resultEle.getProperty('innerText');
        expect(await innerTextHandle.jsonValue()).toEqual('Received: It works!');
    });
});
