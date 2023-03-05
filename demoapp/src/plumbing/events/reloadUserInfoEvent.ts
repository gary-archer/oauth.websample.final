/*
 * An event object for reloading user info
 */
export class ReloadUserInfoEvent {

    private readonly _causeError: boolean;

    public constructor(causeError: boolean) {
        this._causeError= causeError;
    }

    public get causeError(): boolean {
        return this._causeError;
    }
}
