import { someService } from './someService';
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
import { usesWindowService } from './usesWindowService'; // Gets tree-shaken
import './fileThatUsesGlobal'; // Gets tree-shaken
import { SomeServiceType } from '../messaging';

export const validServiceRegistry = {
    [SomeServiceType]: someService,
};
