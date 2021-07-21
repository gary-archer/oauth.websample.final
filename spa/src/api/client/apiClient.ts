import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfo} from '../entities/userInfo';
import {ApiClientOptions} from './apiClientOptions';
import {Channel} from './channel';

/*
 * The entry point for API calls just routes parameterized requests through a channel
 */
export class ApiClient {

    private _channel: Channel;

    public constructor(channel: Channel) {
        this._channel = channel;
    }

    /*
     * We download user info from the API rather than using the id token
     */
    public async getUserInfo(callerOptions?: ApiClientOptions): Promise<UserInfo> {

        const options = {
            path: 'userinfo',
            method: 'GET',
            dataToSend: null,
            causeError: callerOptions?.causeError,
        };
        return await this._channel.fetch(options) as UserInfo;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(callerOptions?: ApiClientOptions): Promise<Company[]> {

        const options = {
            path: 'companies',
            method: 'GET',
            dataToSend: null,
            causeError: callerOptions?.causeError,
        };
        return await this._channel.fetch(options) as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, callerOptions?: ApiClientOptions): Promise<CompanyTransactions> {

        const options = {
            path: `companies/${id}/transactions`,
            method: 'GET',
            dataToSend: null,
            causeError: callerOptions?.causeError,
        };
        return await this._channel.fetch(options) as CompanyTransactions;
    }
}
