import * as $ from 'jquery';
import {UserInfoClaims} from '../entities/userInfoClaims';
import {HttpClient} from '../plumbing/api/httpClient';
import {Authenticator} from '../plumbing/oauth/authenticator';

/*
 * The user info fragment shows within a view to render details of the logged in user
 */
export class UserInfoFragment {

    /*
     * Dependencies
     */
    private readonly _authenticator: Authenticator;
    private readonly _apiBaseUrl: string;

    /*
     * Receive dependencies
     */
    public constructor(authenticator: Authenticator, apiBaseUrl: string) {
        this._authenticator = authenticator;
        this._apiBaseUrl = apiBaseUrl;
    }

    /*
     * Run the view
     */
    public async execute(): Promise<void> {

        // Make the API call
        const claims = await HttpClient.callApi(
            `${this._apiBaseUrl}/userclaims/current`,
            'GET',
            null,
            this._authenticator) as UserInfoClaims;

        // If we could get name info then render it
        if (claims && claims.givenName && claims.familyName) {
            $('.logincontainer').removeClass('hide');
            $('.logintext').text(`${claims.givenName} ${claims.familyName}`);
        }
    }
}
