import {Company} from './company';
import {Transaction} from './transaction';

/*
 * A composite entity of a company and its transactions
 */
export interface CompanyTransactions {
    id: number;
    company: Company;
    transactions: Transaction[];
}
