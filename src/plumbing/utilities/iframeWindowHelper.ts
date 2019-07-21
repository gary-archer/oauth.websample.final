import * as $ from 'jquery';

/*
 * A helper class to ensure that any OAuth trace or error messages are routed to the main window
 */
export class IFrameWindowHelper {

    /*
     * Our code could be running on a hidden token renewal iframe
     * Therefore ensure that we always get UI elements on the main window
     */
    public static getMainWindowElement(itemName: string): any {
        if (IFrameWindowHelper.isIFrameOperation()) {
            return (window.parent as any).$(itemName);
        } else {
            return $(itemName);
        }
    }

    /*
     * Detect whether a particular operation is running on the silent renewal iframe
     */
    public static isIFrameOperation(): boolean {
        return (window.parent && window !== window.parent);
    }
}
