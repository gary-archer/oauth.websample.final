import crypto from 'crypto';
import fs from 'fs';

/*
 * Update the index.html for release builds with some production level tags
 */
export function writeProductionAssets(timestamp: string): void {

    const outFolder = './dist/spa';

    // First remove sourceMappingURL references
    removeSourcemapReference(`${outFolder}/vendor.bundle.min.js`);
    removeSourcemapReference(`${outFolder}/react.bundle.min.js`);
    removeSourcemapReference(`${outFolder}/app.bundle.min.js`);

    // Update CSS resources with a cache busting timestamp and an integrity hash
    updateResource(
        outFolder,
        'href',
        'bootstrap.css',
        'bootstrap.min.css',
        timestamp);

    updateResource(
        outFolder,
        'href',
        'app.css',
        'app.min.css',
        timestamp);

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    updateResource(
        outFolder,
        'src',
        'vendor.bundle.js',
        'vendor.bundle.min.js',
        timestamp);

    updateResource(
        outFolder,
        'src',
        'react.bundle.js',
        'react.bundle.min.js',
        timestamp);

    updateResource(
        outFolder,
        'src',
        'app.bundle.js',
        'app.bundle.min.js',
        timestamp);
}

/*
 * Production source maps enable diagnosis of exception stack traces but the production web host does not use them
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
    outFolder: string,
    itemType: string,
    defaultName: string,
    minimizedName: string,
    timestamp: string): void {

    const integrity = calculateFileHash(`${outFolder}/${minimizedName}`);
    const from = `${itemType}='${defaultName}'`;
    const to = `${itemType}='${minimizedName}?t=${timestamp}' integrity='${integrity}'`;
    updateIndexHtml(outFolder, from, to);
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
function updateIndexHtml(outFolder: string, from: string, to: string): void {

    const oldData = fs.readFileSync(`${outFolder}/index.html`, 'utf8');
    const regex = new RegExp(from, 'g');
    const newData = oldData.replace(regex, to);
    fs.writeFileSync(`${outFolder}/index.html`, newData, 'utf8');
}
