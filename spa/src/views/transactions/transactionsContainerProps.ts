import {NavigateFunction} from 'react-router-dom';
import {TransactionsContainerViewModel} from './transactionsContainerViewModel';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps {

    // The view model
    viewModel: TransactionsContainerViewModel;

    // A navigate function
    navigate: NavigateFunction;
}
