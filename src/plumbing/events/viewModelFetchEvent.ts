/*
 * An event sent before and after a view model fetches API data
 */
export class ViewModelFetchEvent {

    private readonly loaded: boolean;

    public constructor(loaded: boolean) {
        this.loaded= loaded;
    }

    public getLoaded(): boolean {
        return this.loaded;
    }
}
