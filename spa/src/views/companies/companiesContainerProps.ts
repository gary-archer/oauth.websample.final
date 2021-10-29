import {CompaniesContainerViewModel} from './companiesContainerViewModel';

/*
 * Input to the companies container
 */
export interface CompaniesContainerProps {

    // Whether to render the mobile view
    isMobileSize: boolean;

    // The view model
    viewModel: CompaniesContainerViewModel;
}
