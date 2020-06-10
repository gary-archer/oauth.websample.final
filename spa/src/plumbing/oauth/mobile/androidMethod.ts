import {UIError} from '../../errors/uiError';

/*
 * A utility class to deal with calling Android methods, async completion and error responses
 */
export class AndroidMethod {

    /*
     * An interface to call the mobile app and wait for a deferred result
     */
    public static async callAsync(methodName: string, guid?: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            // Get a callback name for this mobile method call
            const callbackName = AndroidMethod._getCallbackName(methodName, guid);
            const customWindow = window as any;

            // First define callback behaviour
            const callback = (data: string, errorJson: string) => {

                // First remove the callback
                delete customWindow[callbackName];

                if (errorJson) {

                    // Handle other errors
                    reject(AndroidMethod._parseMobileError(errorJson));

                } else {

                    // Return a success result
                    resolve(data);
                }
            };

            // Call the mobile method to do the work
            customWindow[callbackName] = callback;
            customWindow.mobileBridge[methodName](callbackName);
        });
    }

    /*
     * The callback name includes a GUID for concurrent operations
     */
    private static _getCallbackName(methodName: string, guid?: string) {

        if (guid) {
            return `callback_${methodName}_${guid}`;
        } else {
            return `callback_${methodName}`;
        }
    }

    /*
     * Parse JSON from the mobile app to our own UI error object
     */
    private static _parseMobileError(errorJson: string): UIError {

        const obj = JSON.parse(errorJson);
        const error = new UIError(obj.area, obj.errorCode, obj.userMessage);

        if (obj.appAuthCode) {
            error.appAuthCode = obj.appAuthCode
        }

        if (obj.details) {
            error.details = obj.details
        }

        if (obj.stack && obj.stack.length) {
            error.stack = obj.stack.join(' ')
        }

        return error;
    }
}
