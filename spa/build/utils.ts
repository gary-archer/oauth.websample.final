/*
 * Return the configuration file for the deployment
 */
export function getConfigurationFile(): string {

    if (process.env.LOCALAPI === 'true') {

        // Run the SPA in development mode with a local API
        return '../deployment/environments/dev-localapi/spa.config.json';

    } else if (process.env.ROLLUP_WATCH === 'true') {

        // Run the SPA development mode against an AWS deployed API
        return '../deployment/environments/dev/spa.config.json';

    } else {

        // Run the SPA in Docker against an AWS deployed API
        return '../deployment/environments/docker/spa.config.json';
    }
}

/*
 * Return the content security policy and other secure headers, to enable production security during development
 */
export function getSecurityHeaders(): void {

    /*headers?:
    | IncomingHttpHeaders
    | OutgoingHttpHeaders
    | {
        // i.e. Parameters<OutgoingMessage["setHeader"]>
        [name: string]: number | string | ReadonlyArray<string>
      }*/
}