import {UIError} from '../../errors/uiError';

/*
 * A utility class to deal with calling mobile methods, async completion and error responses
 */
export class MobileMethodCaller {

    private _isAndroid: boolean;

    public constructor() {
        this._isAndroid = navigator.userAgent.toLowerCase().indexOf('android') !== -1;
    }

    /*
     * An interface to call the mobile app and wait for a deferred result
     */
    public async callAsync(methodName: string, guid?: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            // Get a callback name for this mobile method call
            const callbackName = this._getCallbackName(methodName, guid);
            const customWindow = window as any;

            // First define callback behaviour
            const callback = (data: string, errorJson: string) => {

                // First remove the callback
                delete customWindow[callbackName];

                if (errorJson) {

                    // Handle errors if required
                    reject(this._parseMobileError(errorJson));

                } else {

                    // Otherwise return a success result
                    resolve(data);
                }
            };

            // Call the mobile method to do the work
            customWindow[callbackName] = callback;
            this._callMethod(customWindow, methodName, callbackName);
        });
    }

    /*
     * The callback name includes a GUID for concurrent operations
     */
    private _getCallbackName(methodName: string, guid?: string) {

        if (guid) {
            return `callback_${methodName}_${guid}`;
        } else {
            return `callback_${methodName}`;
        }
    }

    /*
     * Handle differences between Android and iOS interop
     */
    private _callMethod(customWindow: any, methodName: string, callbackName: string) {

        if (this._isAndroid) {

            // For Android we call a method on a mobile object
            customWindow.mobileBridge[methodName](callbackName);

        } else {

            // For iOS we post a message to a message handler custom object
            const request = {
                methodName,
                callbackName,
            };
            customWindow.webkit.messageHandlers.mobileBridge.postMessage(JSON.stringify(request));
        }
    }

    /*
     * Parse JSON from the mobile app to our own UI error object
     */
    private _parseMobileError(errorJson: string): UIError {

        const obj = JSON.parse(errorJson);
        const error = new UIError(obj.area, obj.errorCode, obj.userMessage);

        if (obj.appAuthCode) {
            error.appAuthCode = obj.appAuthCode;
        }

        // These strings are received as base 64 text to deal with characters that need escaping
        if (obj.details) {
            error.details = atob(obj.details);
        }
        if (obj.stack) {
            error.stack = atob(obj.stack);
        }

        return error;
    }
}
