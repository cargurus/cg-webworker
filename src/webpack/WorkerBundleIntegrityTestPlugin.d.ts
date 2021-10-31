import type { Compiler } from 'webpack';

export default class WorkerBundleIntegrityTestPlugin {
    constructor(options: {
        filePattern: string | RegExp;
        origin?: string;
        configDataPayload: Record<string, unknown>;
        useLegacy?: boolean;
    });
    apply(compiler: Compiler): void;
}
