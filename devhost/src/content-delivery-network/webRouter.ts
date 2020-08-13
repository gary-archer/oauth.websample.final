import {Request, Response} from 'express';
import path from 'path';
import {ContentDeliveryNetworkConfiguration} from '../configuration/contentDeliveryNetworkConfiguration';

/*
 * The relative path to web files
 */
const WEB_FILES_ROOT = '../../../spa';

/*
 * A very basic CDN to run on a developer PC, whereas a real world solution would use something like AWS Cloudfront
 */
export class WebRouter {

    private readonly _configuration: ContentDeliveryNetworkConfiguration;

    public constructor(configuration: ContentDeliveryNetworkConfiguration) {
        this._configuration = configuration;
        this._setupCallbacks();
    }

    /*
     * Serve up the requested web file
     */
    public getWebResource(request: Request, response: Response): void {

        let resourcePath = request.path.toLowerCase().replace('/spa', '/');
        if (resourcePath === '/') {
           resourcePath = 'index.html';
        }

        if (resourcePath.indexOf('spa.config') !== -1) {
            resourcePath = this._getWebConfigurationFile();
        }

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/${resourcePath}`);
        this._addSecurityHeaders(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up the requested web file
     */
    public getWebRootResource(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/index.html`);
        this._addSecurityHeaders(response);
        response.sendFile(webFilePath);
    }

    /*
     * Serve up our favicon
     */
    public getFavicon(request: Request, response: Response): void {

        const webFilePath = path.join(`${__dirname}/${WEB_FILES_ROOT}/favicon.ico`);
        this._addSecurityHeaders(response);
        response.sendFile(webFilePath);
    }

    /*
     * Download the web configuration file based on the environment
     */
    private _getWebConfigurationFile() {

        // This option on a developer PC is used to host web content and point to an API on the developer PC
        if (process.env.DEV_CONFIG === 'localapi') {
            return `spa.config.${process.env.DEV_CONFIG}.json`;
        }

        // By default we run web content on the developer PC and point to a Cloud API
        return 'spa.config.localweb.json';
    }

    /*
     * Add standard security headers to the response to prevent various browser attacks
     * https://aws.amazon.com/blogs/networking-and-content-delivery/adding-http-security-headers-using-lambdaedge-and-amazon-cloudfront/
     */
    private _addSecurityHeaders(response: Response) {

        // The connect-src value is used to prevent Javascript code sending OAuth tokens or data from the browser to remote hosts
        const trustedHosts = this._configuration.contentSecurityPolicyHosts.join(' ');
        const policy = `default-src 'none'; script-src 'self'; connect-src 'self' ${trustedHosts}; img-src 'self'; style-src 'self'; object-src 'none'`;

        // Add the headers
        response.setHeader('content-security-policy', policy);
        response.setHeader('strict-transport-security', 'max-age=63072000; includeSubdomains; preload');
        response.setHeader('x-frame-options', 'DENY');
        response.setHeader('x-xss-protection', '1; mode=block');
        response.setHeader('x-content-type-options', 'nosniff');
        response.setHeader('referrer-policy', 'same-origin');
    }

    /*
     * Set up async callbacks
     */
    private _setupCallbacks(): void {
        this.getWebResource = this.getWebResource.bind(this);
        this.getWebRootResource = this.getWebRootResource.bind(this);
        this.getFavicon = this.getFavicon.bind(this);
    }
}
