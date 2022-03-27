const crypto = require('crypto');
const fs = require('fs');

/*
 * Update the index.html for release builds with some production level tags
 */
module.exports = function rewriteIndexHtml(isWatchMode) {

    if (!isWatchMode) {

        // Get the timestamp at the time of the build
        const timestamp = new Date().getTime().toString();

        // Update CSS resources with a cache busting timestamp and an integrity hash
        updateResource('./dist/index.html', 'href', 'bootstrap.min.css', timestamp, calculateFileHash('./dist/bootstrap.min.css'))
        updateResource('./dist/index.html', 'href', 'app.css',           timestamp, calculateFileHash('./dist/app.css'))

        // Update Javascript resources with a cache busting timestamp and an integrity hash
        updateResource('./dist/index.html',     'src', 'vendor.bundle.js', timestamp, calculateFileHash('./dist/vendor.bundle.js'))
        updateResource('./dist/index.html',     'src', 'app.bundle.js',    timestamp, calculateFileHash('./dist/app.bundle.js'))
        updateResource('./dist/loggedout.html', 'src', 'loggedout.js',     timestamp, calculateFileHash('./dist/loggedout.js'))
    }
}

/*
 * Update a resource with a cache busting timestamp and a script integrity value
 */
function updateResource(filePath, itemType, resourceName, timestamp, integrity) {

    const from = `${itemType}='${resourceName}'`;
    const to = `${itemType}='${resourceName}?t=${timestamp}' integrity='${integrity}'`;
    replaceTextInFile(filePath, from, to);
}

/*
 * Calculate the hash of a file, used for subresource integrity in the index.html file
 */
function calculateFileHash(filePath) {

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const base64hash = hashSum.digest('base64');
    return `sha256-${base64hash}`;
}

/*
 * Update a text file, replacing all occurrences of the from text with the to text
 */
function replaceTextInFile(filePath, from, to) {

    const oldData = fs.readFileSync(filePath, 'utf8');
    var regex = new RegExp(from, 'g');
    const newData = oldData.replace(regex, to);
    fs.writeFileSync(filePath, newData, 'utf8');
}
