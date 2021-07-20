import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';
import {UserInfo} from '../entities/userInfo';
import {ApiRequestOptions} from './apiRequestOptions';
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
    public async getUserInfo(options?: ApiRequestOptions): Promise<UserInfo> {

        return await this._channel.fetch('userinfo', 'GET', null, options) as UserInfo;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(options?: ApiRequestOptions): Promise<Company[]> {

        return await this._channel.fetch('companies', 'GET', null, options) as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string, options?: ApiRequestOptions): Promise<CompanyTransactions> {

        return await this._channel.fetch(`companies/${id}/transactions`, 'GET', null, options) as CompanyTransactions;
    }
}
