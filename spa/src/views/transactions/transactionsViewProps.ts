import {NavigateFunction} from 'react-router-dom';
import {TransactionsViewModel} from './transactionsViewModel';

/*
 * Input to the transactions view
 */
export interface TransactionsViewProps {
    viewModel: TransactionsViewModel;
    navigate: NavigateFunction;
}
