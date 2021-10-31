import { someServiceResponse } from '../messaging';

export async function someService() {
    return someServiceResponse(true);
}
