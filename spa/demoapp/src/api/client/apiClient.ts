import axios, {AxiosRequestConfig} from 'axios';
import {Guid} from 'guid-typescript';
import {Company} from '../entities/company';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {CompanyTransactions} from '../entities/companyTransactions';
import {Configuration} from '../../configuration/configuration';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {BaseErrorFactory} from '../../plumbing/errors/lib';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiClientOptions} from './apiClientOptions';

/*
 * A high level class used by the rest of the SPA to trigger API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _sessionId: string;
    private readonly _authenticator: Authenticator;

    public constructor(configuration: Configuration, sessionId: string, authenticator: Authenticator) {

        this._apiBaseUrl = configuration.apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._sessionId = sessionId;
        this._authenticator = authenticator;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(callerOptions?: ApiClientOptions): Promise<Company[]> {

        return this._callApi(
            'companies',
            'GET',
            null,
            callerOptions);
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, callerOptions?: ApiClientOptions): Promise<CompanyTransactions> {

        return this._callApi(
            `companies/${id}/transactions`,
            'GET',
            null,
            callerOptions);
    }

    /*
     * Download user attributes the UI needs that are not stored in the authorization server
     */
    public async getUserInfo(callerOptions?: ApiClientOptions): Promise<ApiUserInfo> {

        return this._callApi(
            'userinfo',
            'GET',
            null,
            callerOptions);
    }

    /*
     * A parameterized method containing application specific logic for managing API calls
     */
    private async _callApi(
        path: string,
        method: string,
        dataToSend: any,
        callerOptions?: ApiClientOptions): Promise<any> {

        if (!this._authenticator.isLoggedIn()) {
            throw ErrorFactory.fromLoginRequired();
        }

        const url = `${this._apiBaseUrl}${path}`;
        try {

            // Call the API
            return await this._callApiWithCredential(url, method, dataToSend, callerOptions);

        } catch (e: any) {

            // Report Ajax errors if this is not a 401
            if (e.statusCode !== 401) {
                throw e;
            }

            // Refresh the access token cookie
            await this._authenticator.synchronizedRefresh();

            // Call the API again with the rewritten access token cookie
            return await this._callApiWithCredential(url, method, dataToSend, callerOptions);
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithCredential(
        url: string,
        method: string,
        dataToSend: any,
        callerOptions?: ApiClientOptions): Promise<any> {

        try {

            // Set options and send the secure cookie to the API origin
            const options = {
                url,
                method,
                data: dataToSend,
                headers: this._getHeaders(callerOptions?.causeError),
                withCredentials: true,
            } as AxiosRequestConfig;

            // Add an anti forgery token on data changing commands
            this._authenticator.addAntiForgeryToken(options);

            // Make the API request
            const response = await axios.request(options);
            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (e: any) {

            throw BaseErrorFactory.fromHttpError(e, url, 'web API');
        }
    }

    /*
     * Add headers for logging and advanced testing purposes
     */
    private _getHeaders(causeError?: boolean | undefined): any {

        const headers: any = {

            // Context headers included in API logs
            'x-mycompany-api-client':     'FinalSPA',
            'x-mycompany-session-id':     this._sessionId,
            'x-mycompany-correlation-id': Guid.create().toString(),
        };

        // A special header can be sent to ask the API to throw a simulated exception
        if (causeError) {
            headers['x-mycompany-test-exception'] = 'SampleApi';
        }

        return headers;
    }
}
