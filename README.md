# authguidance.websample.final

### Overview

* The final SPA code sample using OAuth 2.0 and Open Id Connect, from my blog at https://authguidance.com
* **The sample delivers best Multi Tab Usability, Hardened Security and AWS Serverless Hosting**

### Details

* See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup/) for a summary of behaviour
* See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa/) for details on how to run the code
* See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) post for instructions on cloud deployment

### Programming Languages

* TypeScript and ReactJS are used to implement an SPA that uses access tokens
* Typescript is used to implement a [Development Reverse Proxy](https://authguidance.com/2020/07/21/spa-reverse-proxy-based-token-renewal/) to store refresh tokens in cookies

### SPA Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling

### Deployed Solution

* AWS CloudFront is used as the SPA's Content Delivery Network
* AWS API Gateway is used to host the SPA's OAuth 2.0 Secured API
* AWS Cognito is used as the Authorization Server for the SPA and API
* The [AWS Web Reverse Proxy](https://authguidance.com/2020/07/21/spa-reverse-proxy-implementation/) is implemented as an AWS Cloudfront Edge Lambda
