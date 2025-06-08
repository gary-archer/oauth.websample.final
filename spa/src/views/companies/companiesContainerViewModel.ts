import EventBus from 'js-event-bus';
import {Dispatch, SetStateAction, useState} from 'react';
import {FetchCacheKeys} from '../../api/client/fetchCacheKeys';
import {FetchClient} from '../../api/client/fetchClient';
import {Company} from '../../api/entities/company';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {ViewModelCoordinator} from '../utilities/viewModelCoordinator';

/*
 * The view model for the companies container view
 */
export class CompaniesContainerViewModel {

    private readonly fetchClient: FetchClient;
    private readonly eventBus: EventBus;
    private readonly viewModelCoordinator: ViewModelCoordinator;
    private companies: Company[];
    private error: UIError | null;
    private setCompanies: Dispatch<SetStateAction<Company[]>> | null;
    private setError: Dispatch<SetStateAction<UIError | null>> | null;

    public constructor(
        fetchClient: FetchClient,
        eventBus: EventBus,
        viewModelCoordinator: ViewModelCoordinator,
    ) {
        this.fetchClient = fetchClient;
        this.eventBus = eventBus;
        this.viewModelCoordinator = viewModelCoordinator;
        this.companies = [];
        this.error = null;
        this.setCompanies = null;
        this.setError = null;
    }

    /*
     * For the correct React behavior, the view initializes state every time it loads
     */
    public useState(): void {

        const [, setCompanies] = useState(this.companies);
        this.setCompanies = setCompanies;

        const [, setError] = useState(this.error);
        this.setError = setError;
    }

    /*
     * Property accessors
     */
    public getCompanies(): Company[] {
        return this.companies;
    }

    public getError(): UIError | null {
        return this.error;
    }

    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Get data from the API and then notify the caller
     */
    public async callApi(options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: FetchCacheKeys.Companies,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this.viewModelCoordinator.onMainViewModelLoading();
        this.updateError(null);

        try {

            const result = await this.fetchClient.getCompanyList(fetchOptions);
            if (result) {
                this.updateCompanies(result);
            }

        } catch (e: any) {

            this.updateCompanies([]);
            this.updateError(ErrorFactory.fromException(e));

        } finally {

            this.viewModelCoordinator.onMainViewModelLoaded(fetchOptions.cacheKey);
        }
    }

    /*
     * Update state and the binding system
     */
    private updateCompanies(companies: Company[]): void {

        this.companies = companies;
        if (this.setCompanies) {
            this.setCompanies(this.companies);
        }
    }

    /*
     * Update state and the binding system
     */
    private updateError(error: UIError | null): void {

        this.error = error;
        if (this.setError) {
            this.setError(this.error);
        }
    }
}
