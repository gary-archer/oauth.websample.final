import {Company} from '../../api/entities/company';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * Data managed by the companies container
 */
export interface CompaniesContainerState {

    // The company data
    companies: Company[];

    // Populated when there is an error getting data
    error: UIError | null;
}
