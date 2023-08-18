import {NavigateFunction} from 'react-router-dom';
import {TransactionsContainerViewModel} from './transactionsContainerViewModel';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps {
    viewModel: TransactionsContainerViewModel;
    navigate: NavigateFunction;
}
