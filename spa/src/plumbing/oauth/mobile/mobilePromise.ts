/*
 * A utility class to deal with async exchange with the mobile side
 */
export class MobilePromise {

    /*
     * An interface to call 
     */
    public static async callMobile(
        methodName: string,
        method: (callbackName: string) => void): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            // First define callback behaviour
            const callback = (data: string, error: string) => {

                if (error) {

                    // Report errors
                    reject(new Error('Remote side failed'));

                } else {

                    // Return a success result
                    resolve(data);
                }
            };

            // Persist the callback on the window object so that the mobile side is able to call us back
            const uniqueCallbackName = `callback_${methodName}`;
            (window as any)[uniqueCallbackName] = callback;

            // Call the mobile method, which will return immediately
            method(uniqueCallbackName);
        });
    }
}