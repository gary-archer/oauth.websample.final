import {Company} from '../../api/entities/company';
import {UIError} from '../../errors/uiError';

/*
 * The snapshot of state exposed to the view
 */
export interface CompaniesViewState {
    companies: Company[];
    error: UIError | null;
}
