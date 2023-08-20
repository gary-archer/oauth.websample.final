import crypto from 'crypto';
import fs from 'fs';

/*
 * Trigger the work
 */
execute();

/*
 * Update the index.html for release builds with some production level tags
 */
export function execute() {

    // Get the timestamp at the time of the build
    const timestamp = new Date().getTime().toString();
    const outFolder = './dist';

    // Update CSS resources with a cache busting timestamp and an integrity hash
    updateResource(
        `${outFolder}/index.html`,
        'href',
        'bootstrap.min.css',
        timestamp,
        calculateFileHash(`${outFolder}/bootstrap.min.css`));

    updateResource(
        `${outFolder}/index.html`,
        'href',
        'app.css',
        timestamp,
        calculateFileHash(`${outFolder}/app.css`));

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    updateResource(
        `${outFolder}/index.html`,
        'src',
        'index.mjs',
        timestamp,
        calculateFileHash(`${outFolder}/index.mjs`));
}

/*
 * Update a resource with a cache busting timestamp and a script integrity value
 */
function updateResource(
    filePath,
    itemType,
    resourceName,
    timestamp,
    integrity) {

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
    const regex = new RegExp(from, 'g');
    const newData = oldData.replace(regex, to);
    fs.writeFileSync(filePath, newData, 'utf8');
}
