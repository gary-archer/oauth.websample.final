/*
 * Represents a user requesting a data reload
 */
export class ReloadDataEvent {

    private readonly causeError: boolean;

    public constructor(causeError: boolean) {
        this.causeError= causeError;
    }

    public getCauseError(): boolean {
        return this.causeError;
    }
}
