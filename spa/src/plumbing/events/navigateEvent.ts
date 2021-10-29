/*
 * An event to manage navigation
 */
export class NavigateEvent {

    private readonly _mainView: boolean;

    public constructor(mainView: boolean) {
        this._mainView = mainView;
    }

    public get isMainView(): boolean {
        return this._mainView;
    }
}
