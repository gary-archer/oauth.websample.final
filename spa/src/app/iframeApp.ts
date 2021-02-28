import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorHandler} from '../plumbing/errors/errorHandler';
import {TokenRenewalResponseHandler} from '../plumbing/oauth/web/utilities/tokenRenewalResponseHandler';

/*
 * A mini application for the hidden iframe that does silent token renewal
 */
export class IFrameApp {

    public async execute(): Promise<void> {

        try {

            // Download configuration
            const configuration = await new ConfigurationLoader().download();

            // Handle token renewal responses on an iframe
            const handler = new TokenRenewalResponseHandler(configuration.oauth);
            await handler.handleSilentTokenRenewalResponse();

        } catch (e) {

            // In the event of errors, avoid impacting end users and output the error to the console
            const uiError = ErrorHandler.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            ErrorConsoleReporter.output(uiError);
        }
    }
}
