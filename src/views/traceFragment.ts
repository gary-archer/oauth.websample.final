import * as Handlebars from 'handlebars';
import * as $ from 'jquery';
import * as Oidc from 'oidc-client';
import {IFrameWindowHelper} from '../plumbing/utilities/iframeWindowHelper';
import {OAuthLogger} from '../plumbing/utilities/oauthLogger';

/*
 * The trace fragment shows within a view to render OIDC library details
 */
export class TraceFragment {

    /*
     * Initialize trace controls at application startup
     */
    public static initialize(): void {

        // Initialise the logger and get the level
        const level = OAuthLogger.initialize(TraceFragment._append);

        // Clear the log initially
        if (!IFrameWindowHelper.isIFrameOperation()) {
            TraceFragment.clear();
        }

        // Hide or show trace details depending on the level
        TraceFragment._setTraceVisibility(level);

        // Hide the trace button until we have output
        const clearButton = IFrameWindowHelper.getMainWindowElement('#btnTrace');
        clearButton.addClass('hide');
    }

    /*
     * If the URL has changed to a value such as #log=info then we change the OIDC Client logging level accordingly
     */
    public static updateLevelIfRequired() {
        const level = OAuthLogger.updateLevelIfRequired();
        TraceFragment._setTraceVisibility(level);
    }

    /*
     * Clear trace output
     */
    public static clear(): void {

        // Remove output
        const traceList = IFrameWindowHelper.getMainWindowElement('#trace');
        traceList.html('');

        // Hide the clear button since there is nothing to clear
        const clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearTrace');
        clearButton.addClass('hide');
    }

    /*
     * Change the output state depending on the entered log level
     */
    private static _setTraceVisibility(level: number) {

        const traceContainer = IFrameWindowHelper.getMainWindowElement('.tracecontainer');
        if (level === Oidc.Log.NONE) {
            traceContainer.addClass('hide');
        } else {
            traceContainer.removeClass('hide');
        }
    }

    /*
     * Append to log output
     */
    private static _append(prefix: string, args: any): void {

        // Get the view model data
        const traceViewModel = {
            prefix,
            text: Array.prototype.slice.call(args).join(' : '),
        };

        // Use Handlebars to compile the HTML into a function and handle dangerous characters securely
        const htmlTemplate = `<b>{{prefix}}</b> : {{text}}`;
        const renderer = Handlebars.compile(htmlTemplate);
        const html = renderer(traceViewModel);

        // Make sure any trace info on the hidden iframe is routed to the main window
        const traceList = IFrameWindowHelper.getMainWindowElement('#trace');
        traceList.append($('<li>').html(html));

        // Make sure the trace button is visible when there is output
        const clearButton = IFrameWindowHelper.getMainWindowElement('#btnClearTrace');
        if (clearButton.hasClass('hide')) {
            clearButton.removeClass('hide');
        }
    }
}
