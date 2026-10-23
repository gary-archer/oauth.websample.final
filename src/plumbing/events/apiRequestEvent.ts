/*
 * An event sent when the first API request fires and when all API requests complete
 */
export class ApiRequestEvent {

    private readonly loaded: boolean;

    public constructor(loaded: boolean) {
        this.loaded = loaded;
    }

    public getLoaded(): boolean {
        return this.loaded;
    }
}
