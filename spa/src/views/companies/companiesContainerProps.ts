import {CompaniesContainerViewModel} from './companiesContainerViewModel';

/*
 * Input to the companies container
 */
export interface CompaniesContainerProps {

    // A callback by which we can inform the app view which view is current
    onLoading: () => void;

    // Whether to render the mobile view
    isMobileSize: boolean;

    // The view model
    viewModel: CompaniesContainerViewModel;
}
