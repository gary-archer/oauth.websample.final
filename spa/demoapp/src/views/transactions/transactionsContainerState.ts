import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * UI state presented by the transactions container
 */
export interface TransactionsContainerState {
    data: CompanyTransactions | null;
    error: UIError | null;
}
