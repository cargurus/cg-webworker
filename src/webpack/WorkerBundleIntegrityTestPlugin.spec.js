import webpack from 'webpack';

import failBeforeSetupConfig from '../../test/unitTest/webpackPlugin/mockBuild/fail_before_setup.config';
import failDuringSetupDependenciesConfig from '../../test/unitTest/webpackPlugin/mockBuild/fail_during_setup_dependencies-config';
import failDuringDatastoreInitConfig from '../../test/unitTest/webpackPlugin/mockBuild/fail_during_datastore_init-config';
import failDuringServiceRegistryImportConfig from '../../test/unitTest/webpackPlugin/mockBuild/fail_during_service_registry_import.config';
import successConfig from '../../test/unitTest/webpackPlugin/mockBuild/success-config';
import passWhenTreeshakenConfig from '../../test/unitTest/webpackPlugin/mockBuild/pass_when_violation_is_treeshaken-config';

describe('WorkerBundleIntegrityTestPlugin', () => {
    it('should fail when error thrown before setup called', (done) => {
        webpack(failBeforeSetupConfig, function (err, stats) {
            try {
                if (err) {
                    expect(err).toBeFalsy();
                } else if (stats.hasErrors()) {
                    expect(stats.toJson().errors[0].message).toContain(
                        'WorkerBundleIntegrityTestPlugin:FAILURE - worker bundle failed integrity test: Error: Explode'
                    );
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
    it('should fail when error thrown during dependency setup', (done) => {
        webpack(failDuringSetupDependenciesConfig, function (err, stats) {
            try {
                if (err) {
                    expect(err).toBeFalsy();
                } else if (stats.hasErrors()) {
                    const errors = stats.toJson().errors;
                    expect(errors[0].message).toContain(
                        'WorkerBundleIntegrityTestPlugin:FAILURE - worker bundle failed integrity test: Error: Explode during setupDependencies'
                    );
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
    it('should fail when error thrown during datastore init', (done) => {
        webpack(failDuringDatastoreInitConfig, function (err, stats) {
            try {
                if (err) {
                    expect(err).toBeFalsy();
                } else if (stats.hasErrors()) {
                    const errors = stats.toJson().errors;
                    expect(errors).toHaveLength(1);
                    expect(errors[0].message).toContain(
                        "WorkerBundleIntegrityTestPlugin:FAILURE - worker bundle failed integrity test: Error: Couldn't init datastore."
                    );
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
    it('should fail when service registry import uses unknown globals', (done) => {
        webpack(failDuringServiceRegistryImportConfig, function (err, stats) {
            try {
                if (err) {
                    expect(err).toBeFalsy();
                } else if (stats.hasErrors()) {
                    expect(stats.toJson().errors).toHaveLength(1); // Check that additional, non-fatal error during queue doesn't fail build
                    expect(stats.toJson().errors[0].message).toContain(
                        'WorkerBundleIntegrityTestPlugin:FAILURE - worker bundle failed integrity test: ReferenceError: window is not defined'
                    );
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
    it('should pass when no worker-breaking code used', (done) => {
        webpack(successConfig, function (err, stats) {
            try {
                expect(err).toBeFalsy();
                if (stats.hasErrors()) {
                    expect(stats.toJson().errors).toBeFalsy();
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
    it('should pass when violation in tree-shaken module', (done) => {
        webpack(passWhenTreeshakenConfig, function (err, stats) {
            try {
                expect(err).toBeFalsy();
                if (stats.hasErrors()) {
                    expect(stats.toJson().errors).toBeFalsy();
                }
                done();
            } catch (ex) {
                done(ex);
            }
        });
    }, 30000);
});
