import { usesWindowServiceResponse } from '../messaging';

declare global {
    interface Window {
        urls: { [key: string]: string };
    }
}

// eslint-disable-next-line no-undef
const someUrlsUsedInModuleScope = window.urls;

export async function usesWindowService() {
    return usesWindowServiceResponse(someUrlsUsedInModuleScope);
}
