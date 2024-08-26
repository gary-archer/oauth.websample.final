/*
 * An event to notify when the main view changes
 */
export class NavigatedEvent {

    private readonly _authenticatedView: boolean;

    public constructor(authenticatedView: boolean) {
        this._authenticatedView = authenticatedView;
    }

    public get isAuthenticatedView(): boolean {
        return this._authenticatedView;
    }
}
