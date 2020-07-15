import axios, {AxiosRequestConfig} from 'axios';
import {ErrorHandler} from '../../errors/errorHandler';
import {OAuthConfiguration} from '../../../configuration/oauthConfiguration';

/*
 * A helper class for testing
 */
export class ExpireTokenClient {

    /*
     * Call the server and ask it to rewrite the refresh token in the auth cookie, to make it act expired
     */
    public async expireRefreshToken(oauthConfiguration: OAuthConfiguration): Promise<void> {

        // Send our request form URL encoded, as for other requests to the reverse proxy
        const formData = new URLSearchParams();
        formData.append('client_id', oauthConfiguration.clientId);

        // Define request options
        const url = `${oauthConfiguration.reverseProxyUrl}/expire`;
        const options = {
            url,
            method: 'POST',
            data: formData,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        };

        try {
            // Call our reverse proxy
            await axios.request(options as AxiosRequestConfig);

        } catch (e) {

            // Handle client connectivity errors
            throw ErrorHandler.getFromHttpError(e, url, 'expire_refresh_token');
        }
    }
}
