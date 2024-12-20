/*
 * A simple transaction entity
 */
export interface Transaction {
    id: string;
    investorId: string;
    amountUsd: number;
}
