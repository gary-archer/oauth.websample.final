import express, {Application} from 'express';

/*
 * Serve the web static content for one or more micro frontends
 */
export class WebStaticContent {

    private readonly express: Application;

    public constructor(expressApp: Application) {
        this.express = expressApp;
    }

    /*
     * Handle physical resources for SPAs, then serve index.html for not found requests
     */
    public initialise(): void {

        // Serve static files for the main SPA
        const spaBasePath = '/spa/';
        const spaPhysicalRoot = './spa';
        this.express.use(spaBasePath, express.static(spaPhysicalRoot));

        // Handle not found requests
        this.express.get('*_', (request, response) => {

            const requestPath = request.path.toLowerCase();
            if (requestPath === '/favicon.ico') {

                // Serve the root level favico.ico file
                const rootPhysicalPath = './';
                response.sendFile('favicon.ico', {root: rootPhysicalPath});

            } else if (requestPath.startsWith(spaBasePath)) {

                // Within the SPA serve the defeault document
                response.sendFile('index.html', {root: spaPhysicalRoot});

            } else {

                // For other paths, redirect to the SPA
                response.redirect(spaBasePath);
            }
        });
    }
}
