/*
 * An event to notify when the main view changes
 */
export class NavigatedEvent {

    private readonly authenticatedView: boolean;

    public constructor(authenticatedView: boolean) {
        this.authenticatedView = authenticatedView;
    }

    public get isAuthenticatedView(): boolean {
        return this.authenticatedView;
    }
}
