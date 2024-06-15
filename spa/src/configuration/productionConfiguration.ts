import {Configuration} from './configuration';

/*
 * This deployment points to Serverless APIs
 */
export const productionServerlessConfiguration = {
    bffBaseUrl: 'https://bff.authsamples.com',
} as Configuration;

/*
 * This deployment points to APIs running a Kubernetes cluster
 */
export const productionCloudNativeConfiguration = {
    bffBaseUrl: 'https://bff.authsamples-k8s.com/investments',
} as Configuration;
