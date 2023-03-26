/*
 * An event to move between a loaded state when we have data and an unloaded state otherwise
 */
export class DataStatusEvent {

    private readonly _loaded: boolean;

    public constructor(loaded: boolean) {
        this._loaded= loaded;
    }

    public get loaded(): boolean {
        return this._loaded;
    }
}
