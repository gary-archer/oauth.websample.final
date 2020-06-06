import {Guid} from 'guid-typescript';

/*
 * A utility class to deal with async exchange with the mobile side
 */
export class MobilePromise {

    /*
     * An interface to call the mobile app and wait for a deferred result
     */
    public static async callMobile(methodName: string, mobileAuthenticator: any): Promise<string> {

        return new Promise<string>((resolve, reject) => {

            // First define callback behaviour
            const callback = (data: string, error: string) => {

                // First remove the callback
                delete (window as any)[uniqueCallbackName];

                if (error) {

                    // Report errors
                    reject(new Error(error));

                } else {

                    // Return a success result
                    resolve(data);
                }
            };

            // Persist the callback on the window object so that the mobile side is able to notify us
            const guid = Guid.create().toString();
            const uniqueCallbackName = `callback_${methodName}_${guid}`;
            (window as any)[uniqueCallbackName] = callback;

            // Call the mobile method, which will return immediately
            mobileAuthenticator[methodName](uniqueCallbackName);
        });
    }
}