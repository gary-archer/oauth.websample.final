import crypto from 'crypto';
import fs from 'fs';

/*
 * Update the index.html with some production level tags
 */
export function rewriteIndexHtml(): void {

    // Get the timestamp at the time of the build
    const timestamp = new Date().getTime().toString();

    // Get bundle files that contain chunk names
    const outFolder = '../dist/spa';
    const files = fs.readdirSync(outFolder);
    const appBundleFileName = findChunkFileName(files, /app.*\.js/);
    const reactBundleFileName = findChunkFileName(files, /react.*\.js/);
    const vendorBundleFileName = findChunkFileName(files, /vendor.*\.js/);

    // First remove sourceMappingURL references
    removeSourcemapReference(`${outFolder}/${appBundleFileName}`);
    removeSourcemapReference(`${outFolder}/${reactBundleFileName}`);
    removeSourcemapReference(`${outFolder}/${vendorBundleFileName}`);

    // Update CSS resources with a cache busting timestamp and an integrity hash
    updateResource(
        `${outFolder}/index.html`,
        'href',
        'bootstrap.min.css',
        'bootstrap.min.css',
        timestamp,
        calculateFileHash(`${outFolder}/bootstrap.min.css`));

    updateResource(
        `${outFolder}/index.html`,
        'href',
        'app.css',
        'app.css',
        timestamp,
        calculateFileHash(`${outFolder}/app.css`));

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    updateResource(
        `${outFolder}/index.html`,
        'src',
        'app.bundle.js',
        appBundleFileName,
        timestamp,
        calculateFileHash(`${outFolder}/${appBundleFileName}`));

    updateResource(
        `${outFolder}/index.html`,
        'src',
        'react.bundle.js',
        reactBundleFileName,
        timestamp,
        calculateFileHash(`${outFolder}/${reactBundleFileName}`));

    updateResource(
        `${outFolder}/index.html`,
        'src',
        'vendor.bundle.js',
        vendorBundleFileName,
        timestamp,
        calculateFileHash(`${outFolder}/${vendorBundleFileName}`));
}

/*
 * Find a file expected to exist on disk
 */
function findChunkFileName(files: string[], regex: RegExp): string {

    const filename = files.find((f) => f.match(regex));
    if (!filename) {
        throw new Error(`Unable to find file matching pattern: ${regex}`);
    }

    return filename;
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
    defaultName: string,
    chunkName: string,
    timestamp: string,
    integrity: string): void {

    const from = `${itemType}='${defaultName}'`;
    const to = `${itemType}='${chunkName}?t=${timestamp}' integrity='${integrity}'`;
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
