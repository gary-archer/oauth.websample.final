/*
 * An event sent before and after a view model fetches API data
 */
export class ViewModelFetchEvent {

    private readonly _loaded: boolean;

    public constructor(loaded: boolean) {
        this._loaded= loaded;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}
