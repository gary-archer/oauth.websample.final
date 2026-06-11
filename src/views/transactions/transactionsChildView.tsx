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
            <div key={transaction.id}>
                <div className='rounded-lg border bg-white shadow-sm'>
                    <div className='p-4'>
                        <div className='flex'>
                            <div className='w-1/2'>
                                Transaction ID
                            </div>
                            <div className='w-1/2 text-right font-bold text-blue-700'>
                                {transaction.id}
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='w-1/2'>
                                Investor ID
                            </div>
                            <div className='w-1/2 text-right font-bold text-blue-700'>
                                {transaction.investorId}
                            </div>
                        </div>
                        <div className='flex'>
                            <div className='w-1/2'>
                                Amount USD
                            </div>
                            <div className='w-1/2 text-right font-bold text-green-700'>
                                {Number(transaction.amountUsd).toLocaleString()}
                            </div>
                        </div>
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
            <div className='bg-white rounded-lg ml-5 mr-5'>
                <div className='bg-gray-100 px-4 py-3'>
                    <div className='w-full text-center font-bold'>
                        Today&apos;s Transactions for {props.data.company.name}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-5'>
                    {props.data.transactions.map((transaction) => renderTransaction(transaction))}
                </div>
            </div>
        );
}
