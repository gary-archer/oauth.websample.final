import EventBus from 'js-event-bus';
import {FetchCacheKeys} from '../../api/cache/fetchCacheKeys';
import {ApiClient} from '../../api/client/apiClient';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {ViewLoadOptions} from '../utilities/viewLoadOptions';
import {CompaniesViewState} from './companiesViewState';

/*
 * The companies view model manages API state
 */
export class CompaniesViewModel {

    private readonly apiClient: ApiClient;
    private readonly eventBus: EventBus;
    private listener: (() => void) | null;
    private snapshot: CompaniesViewState;

    public constructor(apiClient: ApiClient, eventBus: EventBus) {

        this.apiClient = apiClient;
        this.eventBus = eventBus;
        this.listener = null;
        this.snapshot = {companies: [], error: null};
    }

    /*
     * Subscribe a listener for useSyncExternalStore and return an unsubscribe function
     */
    public subscribe(listener: () => void): () => void {

        this.listener = listener;
        return () => {
            this.listener = null;
        };
    }

    /*
     * Return the current state
     */
    public getSnapshot(): CompaniesViewState {
        return this.snapshot;
    }

    /*
     * Enable the view to use the EventBus
     */
    public getEventBus(): EventBus {
        return this.eventBus;
    }

    /*
     * Get data from the API and notify the view
     */
    public async callApi(options?: ViewLoadOptions): Promise<void> {

        const fetchOptions = {
            cacheKey: FetchCacheKeys.Companies,
            forceReload: options?.forceReload || false,
            causeError: options?.causeError || false,
        };

        this.snapshot = {companies: this.snapshot.companies, error: null};

        try {

            const result = await this.apiClient.getCompanyList(fetchOptions);
            if (result) {
                this.snapshot = {companies: result, error: null};
            }

        } catch (e: any) {

            this.snapshot = {companies: [], error: ErrorFactory.fromException(e)};

        } finally {

            this.notifyView();
        }
    }

    /*
     * Update the view when the model data changes
     */
    private notifyView(): void {
        if (this.listener) {
            this.listener();
        }
    }
}
