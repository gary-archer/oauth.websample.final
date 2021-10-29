import {RouteComponentProps} from 'react-router-dom';
import {TransactionsContainerViewModel} from './transactionsContainerViewModel';

/*
 * Input to the transactions container
 */
export interface TransactionsContainerProps extends RouteComponentProps<{id: string}> {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;

    // Path parameters
    params?: {id: string};

    // The view model
    viewModel: TransactionsContainerViewModel
}
