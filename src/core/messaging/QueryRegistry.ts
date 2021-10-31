import type { WorkerQuery } from './WorkerQuery';

/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */

export type QueryRegistry<TQR extends {}> = TQR[keyof TQR] extends WorkerQuery<any, any> ? TQR : never;
