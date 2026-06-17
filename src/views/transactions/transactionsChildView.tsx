import {JSX} from 'react';
import {Transaction} from '../../api/entities/transaction';
import {TransactionsChildViewProps} from './transactionsChildViewProps';

/*
 * A child view that does the actual rendering
 */
export function TransactionsChildView(props: TransactionsChildViewProps): JSX.Element {

    /*
     * Render a single transaction
     */
    function renderTransaction(transaction: Transaction): JSX.Element {

        return (
            <div key={transaction.id} className='rounded-lg border border-gray-300 p-3'>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Transaction ID
                    </div>
                    <div className='w-1/2 text-right font-bold text-blue-700'>
                        {transaction.id}
                    </div>
                </div>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Investor ID
                    </div>
                    <div className='w-1/2 text-right font-bold text-blue-700'>
                        {transaction.investorId}
                    </div>
                </div>
                <div className='flex mt-1'>
                    <div className='w-1/2'>
                        Amount USD
                    </div>
                    <div className='w-1/2 text-right font-bold text-green-700'>
                        {Number(transaction.amountUsd).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    /*
     * Render the collection of transactions
     */
    return props.data &&
        (
            <div className='mt-3'>
                <div className='bg-gray-100 p-3 text-center font-bold'>
                    Today&apos;s Transactions for {props.data.company.name}
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 p-3'>
                    {props.data.transactions.map((transaction) => renderTransaction(transaction))}
                </div>
            </div>
        );
}
