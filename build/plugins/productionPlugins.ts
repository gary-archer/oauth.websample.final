import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import {NormalizedOutputOptions, OutputBundle, OutputChunk, Plugin} from 'rollup';

/*
 * Remove the source map line from production bundles
 * I do not deploy map files to the web host, so this prevents browser warnings in the console
 */
export function finalizeBundles(): Plugin {

    const plugin: Plugin = {

        name: 'finalize-bundles',
        generateBundle(options: NormalizedOutputOptions, bundle: OutputBundle): void {

            for (const file of Object.values(bundle)) {

                if (file.type === 'chunk') {

                    const chunk = file as OutputChunk;
                    chunk.code = chunk.code
                        .replace(/\s*\/\/[@#]\s*sourceMappingURL=.*\s*$/, '')
                        .replace(/\s+$/, '');
                }
            }
        },
    };

    return plugin;
}

/*
 * Produce the final index.html with runtime details
 */
export function writeIndexHtml(buildId: string, outputFolder: string): Plugin {

    const plugin: Plugin = {

        name: 'write-index-html',
        async writeBundle(): Promise<void> {
            await rewriteIndexHtml(outputFolder, buildId);
        }
    };

    return plugin;
}

/*
 * Update each item in the index.html file
 */
async function rewriteIndexHtml(outputFolder: string, buildId: string): Promise<void> {

    // Update CSS resources with a cache busting timestamp and an integrity hash
    await updateHtmlItem(
        outputFolder,
        'href',
        'app.css',
        `app.${buildId}.css`);

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    await updateHtmlItem(
        outputFolder,
        'src',
        'vendor.bundle.js',
        `vendor.${buildId}.bundle.js`);

    await updateHtmlItem(
        outputFolder,
        'src',
        'react.bundle.js',
        `react.${buildId}.bundle.js`);

    await updateHtmlItem(
        outputFolder,
        'src',
        'app.bundle.js',
        `app.${buildId}.bundle.js`);
}

/*
 * Update an index.html JS or CSS resource with a dynamic filename and a script integrity value
 */
async function updateHtmlItem(
    outFolder: string,
    itemType: string,
    originalName: string,
    dynamicName: string): Promise<void> {

    const integrity = await calculateItemHash(`${outFolder}/${dynamicName}`);
    const from = `${itemType}='${originalName}'`;
    const to = `${itemType}='${dynamicName}' integrity='${integrity}'`;

    const oldData = await fs.readFile(`${outFolder}/index.html`, 'utf8');
    const regex = new RegExp(from, 'g');
    const newData = oldData.replace(regex, to);
    await fs.writeFile(`${outFolder}/index.html`, newData, 'utf8');
}

/*
 * Calculate the hash of a JS or CSS file, used for subresource integrity in the index.html file
 */
async function calculateItemHash(filePath: string): Promise<string> {

    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const base64hash = hashSum.digest('base64');
    return `sha256-${base64hash}`;
}
