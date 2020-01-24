# authguidance.websample.final

### Overview

* The completed SPA code sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* The SPA connects (by default) to AWS Cognito and an AWS secured API

### Details

* See the [React JS Secured SPA Write Up](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa/) for an overview and how to run the code
* See the [Web Content Delivery Write Up](https://authguidance.com/2018/12/02/spa-content-deployment/) for instructions on cloud deployment

### Programming Languages

* TypeScript and ReactJS are used to implement the SPA

### SPA Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and for token handling

### Hosting

* AWS API Gateway is used to host the SPA's OAuth 2.0 Secured API
* AWS Cognito is used as the Authorization Server for the SPA and API
* AWS CloudFront is used as the SPA's Content Delivery Network
