import * as Handlebars from 'handlebars';
import * as $ from 'jquery';
import {Company} from '../entities/company';
import {HttpClient} from '../plumbing/api/httpClient';
import {Authenticator} from '../plumbing/oauth/authenticator';

/*
 * The list view takes up the entire screen except for the header
 */
export class ListView {

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
        this._setupCallbacks();
    }

    /*
     * Wait for data then render it
     */
    public async execute(): Promise<void> {

        const data = await
            HttpClient.callApi(`${this._apiBaseUrl}/companies`, 'GET', null, this._authenticator) as Company[];
        this._renderData(data);
    }

    /*
     * Hide UI elements when the view unloads
     */
    public unload(): void {
        $('.listcontainer').addClass('hide');
    }

    /*
     * Render data
     */
    private _renderData(companies: Company[]): void {

        // Show and clear
        $('.listcontainer').removeClass('hide');
        $('.companyList').html('');

        companies.forEach((company: Company) => {

            // Format a view model for display
            const companyViewModel = {
                id: company.id,
                name: company.name,
                formattedTargetUsd: Number(company.targetUsd).toLocaleString(),
                formattedInvestmentUsd: Number(company.investmentUsd).toLocaleString(),
                noInvestors: company.noInvestors,
            };

            // The HTML template
            const companiesHtml = `<div class='panel panel-default'>
                                       <div class='panel-body'>
                                           <div class='row'>
                                               <div class='col-xs-1 hide-mobile'>
                                                   <img src='images/{{id}}.svg' />
                                               </div>
                                               <div class='col-xs-2 image-padding'>
                                                   {{name}}
                                               </div>
                                               <div class='col-xs-3 image-padding'>
                                                   <a class='companyLink' data-id={{id}}>View Transactions</a>
                                               </div>
                                               <div class='col-xs-2 amount image-padding'>
                                                   {{formattedTargetUsd}}<br/>
                                               </div>
                                               <div class='col-xs-2 amount image-padding'>
                                                   {{formattedInvestmentUsd}}
                                               </div>
                                               <div class='col-xs-2 image-padding'>
                                                   <div class='col-xs-2'>{{noInvestors}}</div>
                                               </div>
                                           </div>
                                       </div>
                                   </div>`;

            // Use Handlebars to compile the HTML into a function and handle dangerous characters securely
            const renderCompanies = Handlebars.compile(companiesHtml);

            // Execute the function to render data
            $('.companyList').append(renderCompanies(companyViewModel));
        });

        // A click handler will change the view to look at transaction details
        $('.companyLink').on('click', this._selectCompanyTransactions);
    }

    /*
     * When a thumbnail is clicked we will request transactions data and then update the view
     */
    private _selectCompanyTransactions(e: any): void {

        const id = $(e.target).attr('data-id');
        location.hash = `#company=${id}`;
        e.preventDefault();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupCallbacks(): void {
        this._renderData = this._renderData.bind(this);
        this._selectCompanyTransactions = this._selectCompanyTransactions.bind(this);
   }
}
