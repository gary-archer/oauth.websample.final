# authguidance.websample.final

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/authguidance.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/authguidance.websample.final&amp;utm_campaign=Badge_Grade)

[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/authguidance.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/authguidance.websample.final?targetFile=spa/package.json)

### Overview

* The final SPA code sample using OAuth 2.x and Open Id Connect, from my blog at https://authguidance.com
* **The sample uses Cloud Hosting, Hardened Security, and our Final Token Renewal solution**

### Details

* See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
* See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on how to run the code
* See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment) post for details on cloud deployment

### Design Aspects
* See the [Browser Token Security](https://authguidance.com/2019/09/08/ui-token-management) post for how tokens are protected
* See the [Final Token Renewal Solution](https://authguidance.com/2020/07/21/spa-reverse-proxy-based-token-renewal) for options on multi tab / app browsing

### Programming Languages

* TypeScript and ReactJS are used to implement the SPA

### SPA Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and token handling

### Deployed Solution

* AWS CloudFront is used as the SPA's Content Delivery Network
* AWS API Gateway is used to host the SPA's OAuth Secured API
* AWS Cognito is used as the Authorization Server for the SPA and API
* An Edge Lambda is used to write refresh tokens to cookies