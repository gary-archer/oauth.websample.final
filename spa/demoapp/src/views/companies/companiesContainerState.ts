import {Company} from '../../api/entities/company';
import {UIError} from '../../plumbing/errors/lib';

/*
 * Data managed by the companies container
 */
export interface CompaniesContainerState {
    companies: Company[];
    error: UIError | null;
}
