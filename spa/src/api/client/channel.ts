/*
 * API calls are made via a channel, which could potentially represent a mechanism such as a web worker
 */
export interface Channel {
    fetch(options: any): Promise<any>;
}