import {ContentDeliveryNetworkConfiguration} from './contentDeliveryNetworkConfiguration';
import {HostConfiguration} from './hostConfiguration';
import {WebReverseProxyConfiguration} from './webReverseProxyConfiguration';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    host: HostConfiguration;
    contentDeliveryNetwork: ContentDeliveryNetworkConfiguration;
    webReverseProxy: WebReverseProxyConfiguration;
}
