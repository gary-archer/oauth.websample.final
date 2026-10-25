import EventBus from 'js-event-bus';
import {FetchClient} from '../api/client/fetchClient';
import {ApiRequestCoordinator} from '../api/coordination/apiRequestCoordinator';
import {CompaniesViewModel} from '../views/companies/companiesViewModel';
import {TransactionsViewModel} from '../views/transactions/transactionsViewModel';
import {UserInfoViewModel} from '../views/userInfo/userInfoViewModel';

/*
 * Manages global view model objects for the React application
 */
export class ViewModelStore {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly apiRequestCoordinator: ApiRequestCoordinator;

    private companiesViewModel: CompaniesViewModel | null;
    private transactionsViewModel: TransactionsViewModel | null;
    private userInfoViewModel: UserInfoViewModel | null;

    /*
     * Set the initial state when the app starts
     */
    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        apiRequestCoordinator: ApiRequestCoordinator) {

        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.apiRequestCoordinator = apiRequestCoordinator;

        this.companiesViewModel = null;
        this.transactionsViewModel = null;
        this.userInfoViewModel = null;
    }

    /*
     * Create the view model on first use
     */
    public getCompaniesViewModel(): CompaniesViewModel {

        if (!this.companiesViewModel) {

            this.companiesViewModel = new CompaniesViewModel(
                this.fetchClient,
                this.eventBus,
                this.apiRequestCoordinator,
            );
        }

        return this.companiesViewModel;
    }

    /*
     * Create the view model on first use
     */
    public getTransactionsViewModel(): TransactionsViewModel {

        if (!this.transactionsViewModel) {

            this.transactionsViewModel = new TransactionsViewModel
            (
                this.fetchClient,
                this.eventBus,
                this.apiRequestCoordinator,
            );
        }

        return this.transactionsViewModel;
    }

    /*
     * Create the view model on first use
     */
    public getUserInfoViewModel(): UserInfoViewModel {

        if (!this.userInfoViewModel) {

            this.userInfoViewModel = new UserInfoViewModel(
                this.fetchClient,
                this.eventBus,
                this.apiRequestCoordinator,
            );
        }

        return this.userInfoViewModel;
    }
}
