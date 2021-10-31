import webpackModuleConfig from './rollup.build-webpack.config';

import legacyConfigs from './rollup.build-legacy.config';
import modernCoreConfig from './rollup.core.config';
import modernDataStoreConfig from './rollup.dataStore.config';
import reactModernBundleConfig from './rollup.react.config';

export default [
    modernCoreConfig,
    modernDataStoreConfig,
    reactModernBundleConfig,
    webpackModuleConfig,
    ...legacyConfigs,
];
