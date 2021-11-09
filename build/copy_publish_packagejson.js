const path = require('path');
const fs = require('fs');

function updatePublishVersion() {
    fs.readFile(path.resolve(__dirname, '../dist/package.json'), 'utf8', (err, data) => {
        if (err) {
            // eslint-disable-next-line no-console
            console.error("ERROR: Couldn't read dist/package.json: " + err);
            process.exitCode = 1;
        } else {
            const packageJson = JSON.parse(data);
            packageJson.version = process.env.PUBLISH_VERSION || process.env.npm_package_version;
            fs.writeFile(path.resolve(__dirname, '../dist/package.json'), JSON.stringify(packageJson), (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error("ERROR: Couldn't write updated version to dist/package.json: " + err);
                    process.exitCode = 1;
                }
            });
        }
    });
}

fs.copyFile(
    path.resolve(__dirname, '../.npmrc'),
    path.resolve(__dirname, '../dist/.npmrc'),
    function (err) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error('ERROR: couldn\'t copy npmrc ' + err);
            process.exitCode = 1;
        } else {
            fs.copyFile(
                path.resolve(__dirname, './npm_dist_package.json'),
                path.resolve(__dirname, '../dist/package.json'),
                function (err) {
                    if (err) {
                        // eslint-disable-next-line no-console
                        console.error('ERROR: ' + err);
                        process.exitCode = 1;
                    } else {
                        updatePublishVersion();
                    }
                }
            );
        }
    }
);
