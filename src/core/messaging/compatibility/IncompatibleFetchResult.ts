export interface IncompatibleFetchRequest {
    requestId: string;
    type: '__FETCHINCOMPAT';
    payload: {
        input: string;
        init:
            | undefined
            | {
                  method?: string;
                  body?: BodyInit | null;
                  mode?: RequestMode;
                  credentials?: RequestCredentials;
                  cache?: RequestCache;
                  redirect?: RequestRedirect;
                  headers?: { [key: string]: string } | undefined;
              };
    };
}

export interface IncompatibleFetchResult {
    requestId: string;
    type: '__FETCHINCOMPAT';
    payload: {
        error?: {
            errorName: string;
            errorMessage: string;
            errorStack: string | undefined;
        };
        response?: {
            body: string | Blob | ArrayBuffer;
            status: number;
            statusText: string;
            headers: { [key: string]: string };
        };
    };
}
