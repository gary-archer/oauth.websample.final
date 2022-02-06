import {RouteComponentProps} from 'react-router-dom';
import {TransactionsContainerViewModel} from './transactionsContainerViewModel';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps extends RouteComponentProps<{id: string}> {

    // Path parameters
    params?: {id: string};

    // The view model
    viewModel: TransactionsContainerViewModel
}
