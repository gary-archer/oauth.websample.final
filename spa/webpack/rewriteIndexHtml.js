const crypto = require('crypto');
const fs = require('fs');

/*
 * An ad-hoc plugin to update the index.html whenever Javascript code changes
 */
module.exports = function rewriteIndexHtml() {

    // Get the timestamp at the time of the build, used for cache busting
    const timestamp = new Date().getTime().toString();

    // Make updates to the index.html file
    replaceTextInFile('./dist/index.html', 'BUILD_TIMESTAMP', timestamp);
    replaceTextInFile('./dist/index.html', 'INTEGRITY_CSS_BOOTSTRAP', calculateFileHash('./dist/bootstrap.min.css'));
    replaceTextInFile('./dist/index.html', 'INTEGRITY_CSS_APP',       calculateFileHash('./dist/app.css'));
    replaceTextInFile('./dist/index.html', 'INTEGRITY_JS_VENDOR',     calculateFileHash('./dist/vendor.bundle.js'));
    replaceTextInFile('./dist/index.html', 'INTEGRITY_JS_APP',        calculateFileHash('./dist/app.bundle.js'));

    // Make updates to the loggedout.html file
    replaceTextInFile('./dist/loggedout.html', 'BUILD_TIMESTAMP', timestamp);
    replaceTextInFile('./dist/loggedout.html', 'INTEGRITY_JS_LOGGEDOUT', calculateFileHash('./dist/loggedout.js'));
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