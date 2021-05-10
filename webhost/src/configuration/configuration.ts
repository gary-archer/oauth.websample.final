import {SecurityHeaderConfiguration} from './securityHeaderConfiguration';
import {HostConfiguration} from './hostConfiguration';

/*
 * A holder for configuration settings when delivering static content
 */
export interface Configuration {
    host: HostConfiguration;
    securityHeaders: SecurityHeaderConfiguration;
}
