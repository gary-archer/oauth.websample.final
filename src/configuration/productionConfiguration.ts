import {Configuration} from './configuration';

/*
 * This deployment uses Serverless APIs and AWS Cognito
 */
export const productionServerlessConfiguration = {
    bffBaseUrl: 'https://bff.authsamples.com',
    delegationIdClaimName: 'origin_jti',
} as Configuration;

/*
 * This deployment uses Kubernetes APIs and the Curity Identity Server
 */
export const productionCloudNativeConfiguration = {
    bffBaseUrl: 'https://bff.authsamples-k8s.com',
    delegationIdClaimName: 'delegationId',
} as Configuration;
