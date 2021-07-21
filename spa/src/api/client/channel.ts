/*
 * API calls are made via a web worker channel
 */
export interface Channel {
    fetch(options: any): Promise<any>;
}