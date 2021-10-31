import { simpleCallBroker } from './client';
import { simpleLogRequest } from './messages';

(async () => {
    const response = await simpleCallBroker(simpleLogRequest('It works!'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.getElementById('result')!.innerText = response.responseText;
})();
