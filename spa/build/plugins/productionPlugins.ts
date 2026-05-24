import crypto from 'crypto';
import fs from 'fs/promises';
import {PurgeCSS} from 'purgecss';
import {OutputBundle, OutputChunk, Plugin} from 'rollup';

/*
 * Make some small edits to bundles as rollup renders their code
 */
export function renderBundles(timestamp: string): Plugin {

    const plugin: Plugin = {

        name: 'render-bundles',
        renderChunk(code: string) {

            // When bundles reference each other, use a cache busting timestamp
            return {
                code: code.replace(/\.bundle\.js\b/g, `.bundle.js?t=${timestamp}`),
                map: null,
            };
        }
    };

    return plugin;
}

/*
 * Make some small edits once rollup finishes rendering code
 */
export function finalizeBundles(): Plugin {

    const plugin: Plugin = {

        name: 'finalize-bundles',
        generateBundle(options, bundle: OutputBundle) {

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
 * Produce the final CSS and HTML
 */
export function writeCssAndHtml(outputFolder: string, timestamp: string): Plugin {

    const plugin: Plugin = {

        name: 'rewrite-css-and-html',
        async writeBundle() {

            // Write minified CSS to the output folder
            const result = await new PurgeCSS().purge({
                css: ['css/bootstrap.css'],
                content: [`${outputFolder}/app.bundle.js`],
                safelist: ['body', 'container'],
            });
            await fs.writeFile('dist/bootstrap.css', result[0].css);

            // Write the final index.html with subresource integrity attributes and cache busting timestamps
            await rewriteIndexHtml(outputFolder, timestamp);
        }
    };

    return plugin;
}

/*
 * Update each item in the index.html file
 */
async function rewriteIndexHtml(outputFolder: string, timestamp: string): Promise<void> {

    // Update CSS resources with a cache busting timestamp and an integrity hash
    await updateHtmlItem(
        outputFolder,
        'href',
        'bootstrap.css',
        timestamp);

    await updateHtmlItem(
        outputFolder,
        'href',
        'app.css',
        timestamp);

    // Update Javascript resources with a cache busting timestamp and an integrity hash
    await updateHtmlItem(
        outputFolder,
        'src',
        'vendor.bundle.js',
        timestamp);

    await updateHtmlItem(
        outputFolder,
        'src',
        'react.bundle.js',
        timestamp);

    await updateHtmlItem(
        outputFolder,
        'src',
        'app.bundle.js',
        timestamp);
}

/*
 * Update an index.html JS or CSS resource with a cache busting timestamp and a script integrity value
 */
async function updateHtmlItem(
    outFolder: string,
    itemType: string,
    name: string,
    timestamp: string): Promise<void> {

    const integrity = await calculateItemHash(`${outFolder}/${name}`);
    const from = `${itemType}='${name}'`;
    const to = `${itemType}='${name}?t=${timestamp}' integrity='${integrity}'`;

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
