/*
 * This is copied into AWS as an edge lambda and deployed to the distribution as an Origin Response lambda
 * https://aws.amazon.com/blogs/networking-and-content-delivery/adding-http-security-headers-using-lambdaedge-and-amazon-cloudfront
 */
exports.handler = async (event) => {

    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    const headers = response.headers;
  
    // Only apply the headers to our SPA and not to other web content such as interstitial mobile pages
    const request = event.Records[0].cf.request;
    const requestUri = request.uri.toLowerCase();
    if (!requestUri.startsWith('/spa/')) {
        return response;
    }
    
    // Only allow Ajax calls from the browser to the below domains
    const policy = `default-src 'none'; script-src 'self'; connect-src 'self' https://api.authguidance-examples.com https://login.authguidance-examples.com https://cognito-idp.eu-west-2.amazonaws.com; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'self'`;
    headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: policy}]; 

    // Set other security headers according to the above AWS article
    headers['strict-transport-security'] = [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}]; 
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}]; 
    headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}]; 
    headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}]; 
    headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}]; 
    
    return response;
};