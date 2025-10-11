import crypto from 'crypto';
import fs from 'fs';

/*
 * Trigger the work
 */
execute();

/*
 * Update the index.html for release builds with some production level tags
 */
export function execute(): void {

    // Get the timestamp at the time of the build
    const timestamp = new Date().getTime().toString();
    const outFolder = '../dist/spa';

    // First remove sourceMappingURL references
    removeSourcemapReference(`${outFolder}/vendor.bundle.js`);
    removeSourcemapReference(`${outFolder}/react.bundle.js`);
    removeSourcemapReference(`${outFolder}/app.bundle.js`);

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
        'vendor.bundle.js',
        timestamp,
        calculateFileHash(`${outFolder}/vendor.bundle.js`));

    updateResource(
        `${outFolder}/index.html`,
        'src',
        'react.bundle.js',
        timestamp,
        calculateFileHash(`${outFolder}/react.bundle.js`));

    updateResource(
        `${outFolder}/index.html`,
        'src',
        'app.bundle.js',
        timestamp,
        calculateFileHash(`${outFolder}/app.bundle.js`));
}

/*
 * We build source map files and use them to look up exception stack traces if ever needed
 * We do not deploy them to Cloudfront though, and end users should not know about them
 * This removes 'missing sourcemap' warning lines from the browser developer console
 */
function removeSourcemapReference(filePath: string) {

    const textData = fs.readFileSync(filePath, 'utf-8');
    const correctedTextData = textData.split('\n').filter(
        (line) => line.indexOf('sourceMappingURL') === -1).join('\n');

    fs.writeFileSync(filePath, correctedTextData);
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
