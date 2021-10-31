import type {
    dataStoreSubscribeResponse,
    dataStoreUnsubscribeResponse,
    dataStoreChangeNotifySubscribeResponse,
    dataStoreChangeNotifyUnsubscribeResponse,
} from './datastore.workerMessages';
import type { source } from './source';
import { errorAction, unknownActionType, unknownPacket } from 'cg-webworker/core';
import { dataStoreSubscriberNotifyAction } from './datastore.subscriptionMessages';

export type SubscriberResponseMessage =
    | {
          readonly source: typeof source;
          readonly requestId: string;
          readonly message:
              | ReturnType<typeof errorAction>
              | ReturnType<typeof unknownActionType>
              | ReturnType<typeof unknownPacket>
              | ReturnType<typeof dataStoreSubscribeResponse>
              | ReturnType<typeof dataStoreUnsubscribeResponse>
              | ReturnType<typeof dataStoreChangeNotifySubscribeResponse>
              | ReturnType<typeof dataStoreChangeNotifyUnsubscribeResponse>;
      }
    | {
          readonly source: typeof source;
          readonly message: ReturnType<typeof dataStoreSubscriberNotifyAction>;
      };
