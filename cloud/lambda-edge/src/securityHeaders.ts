/*
 * This lambda runs during responses from the origin, to set security headers
 */
const handler = async (event: any) => {

    const response = event.Records[0].cf.response;
    const headers = response.headers;

    // For performance and to reduce error handling scope we hard code hosts into the lambda
    const trustedHosts = [
        'https://api.authsamples.com',
        'https://login.authsamples.com',
        'https://cognito-idp.eu-west-2.amazonaws.com',
    ];

    // Only allow Ajax calls from the browser to our own domains
    const policy = `default-src 'none'; script-src 'self'; connect-src 'self' ${trustedHosts.join(' ')}; img-src 'self'; style-src 'self'; object-src 'self';`;
    headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: policy}];

    // Set other security headers according to the above AWS article
    headers['strict-transport-security'] = [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}];
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}];
    headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}];
    headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}];
    headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}];
    return response;
};

// Export the handler to serverless.yml
export {handler};
