/*
 * This is copied into AWS as an edge lambda and deployed to the distribution as an Origin Response lambda
 * https://aws.amazon.com/blogs/networking-and-content-delivery/adding-http-security-headers-using-lambdaedge-and-amazon-cloudfront
 */
exports.handler = async (event) => {

    const response = event.Records[0].cf.response;
    const headers = response.headers;
  
    // Only allow Ajax calls from the browser to our own domains
    const trustedHosts = 'https://api.authsamples.com https://login.authsamples.com https://cognito-idp.eu-west-2.amazonaws.com';
    const policy = `default-src 'none'; script-src 'self'; connect-src 'self' ${trustedHosts}; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'self'`;
    headers['content-security-policy'] = [{key: 'Content-Security-Policy', value: policy}]; 

    // Set other security headers according to the above AWS article
    headers['strict-transport-security'] = [{key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload'}]; 
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'DENY'}]; 
    headers['x-content-type-options'] = [{key: 'X-Content-Type-Options', value: 'nosniff'}]; 
    headers['x-xss-protection'] = [{key: 'X-XSS-Protection', value: '1; mode=block'}]; 
    headers['referrer-policy'] = [{key: 'Referrer-Policy', value: 'same-origin'}]; 
    
    return response;
};