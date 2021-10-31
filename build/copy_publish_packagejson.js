const path = require('path');
const fs = require('fs');

fs.copyFile(
    path.resolve(__dirname, './npm_dist_package.json'),
    path.resolve(__dirname, '../dist/package.json'),
    function (err) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error('ERROR: ' + err);
            process.exitCode = 1;
        }
    }
);

// fs.rename('./npm_dist_package.json', '../dist/', function(err) {
//     if (err) {
//         console.error('ERROR: ' + err);
//         process.exitCode = 1;
//     }
// });
