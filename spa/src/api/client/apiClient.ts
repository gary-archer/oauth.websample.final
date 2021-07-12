import axios, {Method} from 'axios';
import {Guid} from 'guid-typescript';
import {ErrorHandler} from '../../plumbing/errors/errorHandler';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {SessionManager} from '../../plumbing/utilities/sessionManager';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfo} from '../entities/userInfo';
import {ApiRequestOptions} from './apiRequestOptions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _authenticator: Authenticator;
    private readonly _sessionId: string;

    public constructor(apiBaseUrl: string, authenticator: Authenticator) {

        this._apiBaseUrl = apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._authenticator = authenticator;
        this._sessionId = SessionManager.get();

        const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype.setRequestHeader = function(key, val) {
            console.log(`*** Intercepted header: ${key}, ${val}`);
            origSetRequestHeader.call(this, key, val);
        };
    }

    /*
     * We download user info from the API rather than using the id token
     */
    public async getUserInfo(options?: ApiRequestOptions): Promise<UserInfo> {

        return await this._callApi('userinfo', 'GET', null, options) as UserInfo;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(options?: ApiRequestOptions): Promise<Company[]> {

        return await this._callApi('companies', 'GET', null, options) as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, options?: ApiRequestOptions): Promise<CompanyTransactions> {

        return await this._callApi(`companies/${id}/transactions`, 'GET', null, options) as CompanyTransactions;
    }

    /*
     * A central method to get data from an API in a parameterized way
     */
    private async _callApi(
        path: string,
        method: Method,
        dataToSend?: any,
        options?: ApiRequestOptions): Promise<any> {

        const url = `${this._apiBaseUrl}${path}`;
        try {

            return await this._authenticator.callApiWithAccessToken(async (token) => {
                
                // Make the API call in an isolated context that can use the access token
                const response = await axios.request({
                    url,
                    method,
                    data: dataToSend,
                    headers: this._getHeaders(token, options),
                });
                AxiosUtils.checkJson(response.data);
                return response.data;
            });

        } catch (error1) {

            throw ErrorHandler.getFromHttpError(error1, url, 'Web API');
        }
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(accessToken: any, options?: ApiRequestOptions): any {

        const headers: any = {

            // The required authorization header
            'Authorization': `Bearer ${accessToken}`,

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (options && options.causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }
}
