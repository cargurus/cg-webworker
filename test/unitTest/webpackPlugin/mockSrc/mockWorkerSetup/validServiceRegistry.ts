import { SomeServiceType } from '../messaging';
import { someService } from './someService';

export const validServiceRegistry = {
    [SomeServiceType]: someService,
};
