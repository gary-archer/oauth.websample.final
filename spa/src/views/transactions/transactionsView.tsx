import {JSX} from 'react';
import {Transaction} from '../../api/entities/transaction';
import {TransactionsViewProps} from './transactionsViewProps';

/*
 * Render the transactions main view
 */
export function TransactionsView(props: TransactionsViewProps): JSX.Element {

    /*
     * Render a single item
     */
    function renderTransaction(transaction: Transaction): JSX.Element {

        return (
            <div className='col-lg-4 col-md-6 col-xs-12' key={transaction.id}>
                <div className='card'>
                    <div className='card-body'>
                        <div className='row'>
                            <div className='col-6'>
                                Transaction ID
                            </div>
                            <div className='col-6 text-end valuecolor fw-bold'>
                                {transaction.id}
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                Investor ID
                            </div>
                            <div className='col-6 text-end valuecolor fw-bold'>
                                {transaction.investorId}
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                Amount USD
                            </div>
                            <div className='col-6 text-end highlightcolor fw-bold'>
                                {Number(transaction.amountUsd).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Render the data on a wide screen
     */
    return props.data &&
        (
            <div className='card border-0'>
                <div className='card-header row fw-bold'>
                    <div className='col-12 text-center mx-auto fw-bold'>
                        Today&apos;s Transactions for {props.data.company.name}
                    </div>
                </div>
                <div className='row'>
                    {props.data.transactions.map((transaction) => renderTransaction(transaction))}
                </div>
            </div>
        );
}
