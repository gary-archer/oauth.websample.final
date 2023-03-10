import crypto from 'crypto';
import fs from 'fs';

/*
 * Update the index.html for release builds with some production level tags
 */
export function rewriteIndexHtml(): void {

    // Get the timestamp at the time of the build
    const timestamp = new Date().getTime().toString();
    const outFolder = './dist';

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    updateResource(
        `${outFolder}/index.html`,
        'src',
        'app.bundle.js',
        timestamp,
        calculateFileHash(`${outFolder}/app.bundle.js`));
}

/*
 * Update a resource with a cache busting timestamp and a script integrity value
 */
function updateResource(
    filePath: string,
    itemType: string,
    resourceName: string,
    timestamp: string,
    integrity: string): void {

    const from = `${itemType}='${resourceName}'`;
    const to = `${itemType}='${resourceName}?t=${timestamp}' integrity='${integrity}'`;
    replaceTextInFile(filePath, from, to);
}

/*
 * Calculate the hash of a file, used for subresource integrity in the index.html file
 */
function calculateFileHash(filePath: string): string {

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const base64hash = hashSum.digest('base64');
    return `sha256-${base64hash}`;
}

/*
 * Update a text file, replacing all occurrences of the from text with the to text
 */
function replaceTextInFile(filePath: string, from: string, to: string): void {

    const oldData = fs.readFileSync(filePath, 'utf8');
    const regex = new RegExp(from, 'g');
    const newData = oldData.replace(regex, to);
    fs.writeFileSync(filePath, newData, 'utf8');
}
