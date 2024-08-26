/*
 * Represents a user requesting a data reload
 */
export class ReloadDataEvent {

    private readonly _causeError: boolean;

    public constructor(causeError: boolean) {
        this._causeError= causeError;
    }

    public get causeError(): boolean {
        return this._causeError;
    }
}
