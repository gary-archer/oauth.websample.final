import {CompanyTransactions} from '../../api/entities/companyTransactions';

/*
 * UI state presented by the transactions container
 */
export interface TransactionsContainerState {
    data: CompanyTransactions | null;
}
