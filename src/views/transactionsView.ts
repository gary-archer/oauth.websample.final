import * as Handlebars from 'handlebars';
import * as $ from 'jquery';
import {CompanyTransactions} from '../entities/companyTransactions';
import {Transaction} from '../entities/transaction';
import {HttpClient} from '../plumbing/api/httpClient';
import {Authenticator} from '../plumbing/oauth/authenticator';

/*
 * The transactions view takes up the entire screen except for the header
 */
export class TransactionsView {

    /*
     * Dependencies
     */
    private readonly _authenticator: Authenticator;
    private readonly _apiBaseUrl: string;
    private readonly _companyId: string;

    /*
     * Receive dependencies
     */
    public constructor(authenticator: Authenticator, apiBaseUrl: string, companyId: string) {
        this._authenticator = authenticator;
        this._apiBaseUrl = apiBaseUrl;
        this._companyId = companyId;
        this._setupCallbacks();
    }

    /*
     * Wait for data then render it
     */
    public async execute(): Promise<void> {

        try {
            const url = `${this._apiBaseUrl}/companies/${this._companyId}/transactions`;
            const data = await HttpClient.callApi(url, 'GET', null, this._authenticator) as CompanyTransactions;
            this._renderData(data);

        } catch (uiError) {

            // Handle invalid input due to typing an id into the browser address bar
            if (uiError.statusCode === 404 && uiError.errorCode === 'company_not_found') {

              // User typed an id value outside of allowed company ids
              location.hash = '#';

          } else if (uiError.statusCode === 400 && uiError.errorCode === 'invalid_company_id') {

              // User typed an invalid id such as 'abc'
              location.hash = '#';

          } else {
              throw uiError;
          }
      }
  }

  /*
   * Hide UI elements when the view unloads
   */
  public unload(): void {
      $('.transactionscontainer').addClass('hide');
  }

  /*
   * Render data after receiving it from the API
   */
  private _renderData(data: CompanyTransactions): void {

      // Show and clear
      $('.transactionscontainer').removeClass('hide');
      $('.transactionslist').html('');
      $('.transactionsheader').text(`Today's Transactions for ${data.company.name}`);

      data.transactions.forEach((transaction: Transaction) => {

        // Format a view model for display
        const transactionViewModel = {
            id: transaction.id,
            investorId: transaction.investorId,
            formattedAmountUsd: Number(transaction.amountUsd).toLocaleString(),
        };

        // The HTML template
        const transactionHtml = `<div class='item col-md-3 col-xs-6'>
                                     <div class='thumbnail'>
                                         <div class='caption row'>
                                             <div class='col-xs-6 text-left'>Transaction Id</div>
                                             <div class='col-xs-6 text-right link'>{{id}}</div>
                                         </div>
                                         <div class='caption row'>
                                             <div class='col-xs-6 text-left'>Investor Id</div>
                                             <div class='col-xs-6 text-right link'>{{investorId}}</div>
                                         </div>
                                         <div class='caption row'>
                                             <div class='col-xs-6 text-left'>Amount USD</div>
                                             <div class='col-xs-6 text-right amount'>{{formattedAmountUsd}}</div>
                                         </div>
                                     </div>
                                 </div>`;

        // Use Handlebars to compile the HTML into a function and handle dangerous characters securely
        const renderTransaction = Handlebars.compile(transactionHtml);

        // Execute the function to render data
        $('.transactionslist').append(renderTransaction(transactionViewModel));
    });
  }

  /*
   * Plumbing to ensure that the this parameter is available in async callbacks
   */
  private _setupCallbacks(): void {
      this._renderData = this._renderData.bind(this);
  }
}
