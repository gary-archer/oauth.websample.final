import {BrowserHistory} from 'history';
import {TransactionsContainerViewModel} from './transactionsContainerViewModel';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps {

    // The view model
    viewModel: TransactionsContainerViewModel;

    // The browser history
    history: BrowserHistory;
}
