import {Company} from '../../api/entities/company';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Data managed by the companies container
 */
export interface CompaniesContainerState {
    companies: Company[];
    error: UIError | null;
}
