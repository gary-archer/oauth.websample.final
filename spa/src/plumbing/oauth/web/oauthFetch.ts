import axios, {AxiosRequestConfig, Method} from 'axios';
import {Guid} from 'guid-typescript';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';
import {ErrorHandler} from '../../errors/errorHandler';
import {AxiosUtils} from '../../utilities/axiosUtils';
import {UrlHelper} from '../../utilities/urlHelper';

/*
 * Lower level logic related to calling OAuth Proxy API endpoints
 */
export class OAuthFetch {

    private readonly _bffApiBaseUrl: string;
    private readonly _sessionId: string;

    public constructor(configuration: OAuthConfiguration, sessionId: string) {

        this._bffApiBaseUrl = configuration.bffApiBaseUrl;
        this._sessionId = sessionId;
    }

    /*
     * A central method to call the OAuth Proxy API in a parameterized way
     */
    public async execute(
        method: Method,
        operationPath: string,
        antiForgeryToken: string | null,
        requestData: any): Promise<any> {

        const url = UrlHelper.append(this._bffApiBaseUrl, operationPath);

        try {

            // Same site cookies are also cross origin so the withCredentials flag is needed
            const options: any = {
                url,
                method,
                headers: {
                    accept: 'application/json',
                },
                withCredentials: true,
            };

            // Post data unless the payload is empty
            if (requestData) {
                options.data = requestData;
                options.headers['content-type'] = 'application/json';
            }

            // Add the anti forgery token when we have one
            if (antiForgeryToken) {
                options.headers['x-mycompany-aft-finalspa'] = antiForgeryToken;
            }

            // Supply headers for the proxy API to write to logs
            options.headers['x-mycompany-api-client'] = 'FinalSPA';
            options.headers['x-mycompany-session-id'] = this._sessionId;
            options.headers['x-mycompany-correlation-id'] = Guid.create().toString();

            // Make the request and return the response
            const response = await axios.request(options as AxiosRequestConfig);
            if (response.data) {

                AxiosUtils.checkJson(response.data);
                return response.data;
            }

            return null;

        } catch (e) {

            throw ErrorHandler.getFromHttpError(e, url, 'OAuth Proxy API');
        }
    }
}
