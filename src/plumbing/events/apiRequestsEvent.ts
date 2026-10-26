/*
 * An event sent when a batch of API requests starts or completes
 */
export class ApiRequestsEvent {

    private readonly completed: boolean;

    public constructor(completed: boolean) {
        this.completed = completed;
    }

    public getCompleted(): boolean {
        return this.completed;
    }
}
