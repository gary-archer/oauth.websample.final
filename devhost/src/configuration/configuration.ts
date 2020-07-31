import {ContentDeliveryNetworkConfiguration} from './contentDeliveryNetworkConfiguration';
import {HostConfiguration} from './hostConfiguration';
import {ReverseProxyConfiguration} from './reverseProxyConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    host: HostConfiguration;
    contentDeliveryNetwork: ContentDeliveryNetworkConfiguration;
    reverseProxy: ReverseProxyConfiguration;
}
