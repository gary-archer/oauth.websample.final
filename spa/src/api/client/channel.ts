/*
 * A generic fetch method that can be customized by the application
 */
export interface Channel {

    fetch(options: any): Promise<any>;
}