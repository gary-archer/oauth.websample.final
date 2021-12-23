import {UIError} from '../errors/uiError';

/*
 * An event to manage setting an error in the error summary view
 */
export class SetErrorEvent {

    private readonly _containingViewName: string;
    private readonly _error: UIError | null;

    public constructor(containingViewName: string, error: UIError) {
        this._containingViewName = containingViewName;
        this._error = error;
    }

    public get containingViewName(): string {
        return this._containingViewName;
    }

    public get error(): UIError | null {
        return this._error;
    }
}
