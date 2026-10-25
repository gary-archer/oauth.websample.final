import {CompanyTransactions} from '../../api/entities/companyTransactions';
import {UIError} from '../../plumbing/errors/uiError';

/*
 * The snapshot of state exposed to the view
 */
export interface TransactionsViewState {
    data: CompanyTransactions | null;
    error: UIError | null;
}
