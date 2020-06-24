import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {OktaTokenRenewalResponseHandler} from '../plumbing/oauth/okta/oktaTokenRenewalResponseHandler';

/*
 * A mini application for the hidden iframe that does silent token renewal
 */
export class IFrameApp {

    public async execute(): Promise<void> {

        try {

            // First download configuration from the browser's web domain
            const configuration = await ConfigurationLoader.download('spa.config.json');

            // Handle token renewal responses on an iframe when using Okta
            // Note that with Cognito we use refresh tokens instead
            const handler = new OktaTokenRenewalResponseHandler(configuration.oauth);
            await handler.handleSilentTokenRenewalResponse();

        } catch (e) {

            // In the event of errors, avoid impacting end users and output the error to the console
            const error = ErrorHandler.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            ErrorConsoleReporter.output(error);
        }
    }
}
