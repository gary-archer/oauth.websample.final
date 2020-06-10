import {UIError} from '../../errors/uiError';

/*
 * A utility class to deal with calling iOS methods, async completion and error responses
 */
export class IosMethod {

    /*
     * An interface to call the mobile app and wait for a deferred result
     */
    public static async callAsync(methodName: string, guid?: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            // Get a callback name for this mobile method call
            const callbackName = IosMethod._getCallbackName(methodName, guid);
            const customWindow = window as any;

            // First define callback behaviour
            const callback = (data: string, errorJson: string) => {

                // First remove the callback
                console.log('YAY RESPONSE');
                console.log(data);
                delete customWindow[callbackName];

                if (errorJson) {

                    // Handle other errors
                    reject(IosMethod._parseMobileError(errorJson));

                } else {

                    // Return a success result
                    resolve(data);
                }
            };

            // Call the mobile method to do the work
            customWindow[callbackName] = callback;
            const request = {
                methodName,
                callbackName,
            };
            customWindow.webkit.messageHandlers.mobileBridge.postMessage(JSON.stringify(request));
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
