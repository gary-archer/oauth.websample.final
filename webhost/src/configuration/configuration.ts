import {SecurityHeaderConfiguration} from './securityHeaderConfiguration';
import {HostConfiguration} from './hostConfiguration';
import {ReverseProxyConfiguration} from './reverseProxyConfiguration';

/*
 * A holder for configuration settings when delivering static content
 */
export interface Configuration {
    host: HostConfiguration;
    securityHeaders: SecurityHeaderConfiguration;
    reverseProxy: ReverseProxyConfiguration;
}
