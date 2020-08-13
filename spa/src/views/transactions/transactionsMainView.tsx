import React from 'react';
import {Transaction} from '../../api/entities/transaction';
import {TransactionsViewProps} from './transactionsViewProps';

/*
 * Render the transactions main view
 */
export class TransactionsMainView extends React.Component<TransactionsViewProps> {

    public constructor(props: TransactionsViewProps) {
        super(props);
    }

    /*
     * Render the data on a wide screen
     */
    public render(): React.ReactNode {

        return  this.props.data &&
                (
                    <div className='card border-0'>
                        <div className='card-header row font-weight-bold'>
                            <div className='col-12 text-center mx-auto font-weight-bold'>
                                Today's Transactions for {this.props.data.company.name}
                            </div>
                        </div>
                        <div className='row'>
                            {this.props.data.transactions.map((transaction) => this._renderTransaction(transaction))}
                        </div>
                    </div>
                );
    }

    /*
     * Render a single transaction item
     */
    private _renderTransaction(transaction: Transaction) {

        return (
            <div className='col-lg-4 col-md-6 col-xs-12' key={transaction.id}>
                <div className='card'>
                    <div className='card-body'>
                        <div className='row'>
                            <div className='col-6'>
                                Transaction Id
                            </div>
                            <div className='col-6 text-right valuecolor font-weight-bold'>
                                {transaction.id}
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                Investor Id
                            </div>
                            <div className='col-6 text-right valuecolor font-weight-bold'>
                                {transaction.investorId}
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-6'>
                                Amount USD
                            </div>
                            <div className='col-6 text-right moneycolor font-weight-bold'>
                                {Number(transaction.amountUsd).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
