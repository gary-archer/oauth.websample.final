import {Context} from 'aws-lambda';

/*
 * This lambda runs during responses from the origin, to set security headers
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const handler = async (event: any, context: Context) => {

    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    const responseHeaders = response.headers;

    // The API domain is configured in Cloudfront as an origin custom header
    const apiDomain = request.headers['x-api-domain'][0].value;

    // Prevent external sites being able to abuse the SPA's web origin
    let policy = "default-src 'none';";
    policy += " script-src 'self';";
    policy += ` connect-src 'self' ${apiDomain};`;
    policy += " child-src 'self';";
    policy += " img-src 'self';";
    policy += " style-src 'self';";
    policy += " object-src 'none';";
    policy += " frame-ancestors 'none';";
    policy += " base-uri 'self';";
    policy += " form-action 'self'";

    // Add standard headers, including the content security policy
    responseHeaders['content-security-policy'] = [{key: 'Content-Security-Policy', value: policy}];
    responseHeaders['strict-transport-security'] =
        [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}];
    responseHeaders['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}];
    responseHeaders['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}];
    responseHeaders['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}];
    responseHeaders['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}];
    return response;
};

// Export the handler to serverless.yml
export {handler};
