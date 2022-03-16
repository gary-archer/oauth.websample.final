import {Context} from 'aws-lambda';

/*
 * This lambda runs during responses from the origin, to set security headers
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler: any = async (event: any, context: Context) => {

    const response = event.Records[0].cf.response;
    const headers = response.headers;

    // Only allow Ajax calls from the browser to our API domain, and code to execute from our web origin
    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += " connect-src 'self' https://tokenhandler.authsamples.com;";
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none'";
    headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: policy}];

    // Set other security headers
    headers['strict-transport-security'] =
        [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}];
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}];
    headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}];
    headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}];
    headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}];
    return response;
};

// Export the handler to serverless.yml
export {handler};
