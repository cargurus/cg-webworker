import { SomeServiceType, UsesWindowType } from '../messaging';
import { someService } from './someService';
import { usesWindowService } from './usesWindowService';

export const serviceRegistryThatUsesWindow = {
    [SomeServiceType]: someService,
    [UsesWindowType]: usesWindowService,
};
