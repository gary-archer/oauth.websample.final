import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * UI state presented by the transactions container
 */
export interface TransactionsContainerState {

    // Populated when there is an error getting data
    data: CompanyTransactions | null;

    // Populated when there is an error getting data
    error: UIError | null;
}
