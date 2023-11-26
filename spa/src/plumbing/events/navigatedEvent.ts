/*
 * An event to notify when main view navigation occurs
 */
export class NavigatedEvent {

    private readonly _mainView: boolean;

    public constructor(mainView: boolean) {
        this._mainView = mainView;
    }

    public get isMainView(): boolean {
        return this._mainView;
    }
}
