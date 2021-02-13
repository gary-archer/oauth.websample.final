import axios, {Method} from 'axios';
import {MetadataService, OidcClientSettings, OidcMetadata} from 'oidc-client';
import {ErrorHandler} from '../../../errors/errorHandler';
import {AxiosUtils} from '../../../utilities/axiosUtils';

/*
 * A custom metadata service to allow us to override endpoints when required
 */
// @ts-expect-error - The MetadataService interface cannot be implemented in Typescript due to the 'new' method
export class CustomMetadataService implements MetadataService {

    public metadataUrl?: string = undefined;
    private _customTokenEndpoint: string | null;
    private _metadata: OidcMetadata | null;
    private _signingKeys: any;

    public constructor(settings: OidcClientSettings) {

        this.metadataUrl = `${settings.authority!}/.well-known/openid-configuration`;
        this._customTokenEndpoint = null;
        this._metadata = null;
        this._signingKeys = null;
    }

    /*
     * Support overriding this endpoint
     */
    public set customTokenEndpoint(value: string) {
        this._customTokenEndpoint = value;
    }

    /*
     * Fetch metadata when needed
     */
    public async getMetadata(): Promise<OidcMetadata> {

        if (!this._metadata) {
            console.log('*** GETTING METADATA');
            this._metadata = await this.getJson(this.metadataUrl!);
            console.log('*** GOT METADATA');
        }

        return this._metadata!;
    }

    /*
     * Return the issuer in tokens
     */
    public async getIssuer(): Promise<string> {
        return (await this.getMetadata()).issuer;
    }

    /*
     * Return the endpoint for user redirects
     */
    public async getAuthorizationEndpoint(): Promise<string> {
        return (await this.getMetadata()).authorization_endpoint;
    }

    /*
     * Return the endpoint for user info
     */
    public async getUserInfoEndpoint(): Promise<string> {
        return (await this.getMetadata()).userinfo_endpoint;
    }

    /*
     * Return the endpoint from which we get tokens
     */
    public async getTokenEndpoint(): Promise<string | undefined> {

        if (this._customTokenEndpoint) {
            return this._customTokenEndpoint;
        }

        return (await this.getMetadata()).token_endpoint;
    }

    /*
     * Return the endpoint from which check session Javascript is downloaded
     */
    public async getCheckSessionIframe(): Promise<string | undefined> {
        return (await this.getMetadata()).check_session_iframe;
    }

    /*
     * Return the end session endpoint
     */
    public async getEndSessionEndpoint(): Promise<string | undefined> {
        return (await this.getMetadata()).end_session_endpoint;
    }

    /*
     * Return the revocation endpoint
     */
    public async getRevocationEndpoint(): Promise<string | undefined> {
        return (await this.getMetadata()).registration_endpoint;
    }

    /*
     * Return the JWKS endpoint
     */
    public async getKeysEndpoint(): Promise<string | undefined> {
        return (await this.getMetadata()).jwks_uri;
    }

    /*
     * Download JWKS public keys when requested
     */
    public async getSigningKeys(): Promise<any> {

        if (!this._signingKeys) {
            console.log('*** GET SIGNING KEYS');
            const keySet = await this.getJson(this._metadata!.jwks_uri);
            this._signingKeys = keySet.keys;
            console.log('*** YAY GOT KEYS');
        }

        return this._signingKeys;
    }

    /*
     * Support regetting signing keys
     */
    public resetSigningKeys(): void {
        this._signingKeys = null;
    }

    /*
     * Do the work to retrieve the JSON
     */
    private async getJson(url: string) : Promise<any> {

        try {

            const method: Method = 'GET';
            const response = await axios.request({
                url,
                method,
                headers: {
                    'Accept': 'application/json',
                },
            });

            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (e) {

            throw ErrorHandler.getFromHttpError(e, url, 'Metadata');
        }
    }
}
