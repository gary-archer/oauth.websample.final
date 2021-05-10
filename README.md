# oauth.websample.final

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

### Overview

* The final SPA code sample using OAuth and Open Id Connect, from my blog at https://authguidance.com
* **The sample uses Cloud Hosting, Hardened Security and a Custom Token Renewal solution**

### Details

* See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
* See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on how to run the code
* See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment) post for details on cloud deployment

### Programming Languages

* TypeScript and ReactJS are used to implement the SPA

### Deployed Solution

* AWS CloudFront is used as the SPA's Content Delivery Network
* AWS API Gateway is used to host the SPA's OAuth Secured API
* AWS Cognito is used as the default Authorization Server for the SPA and API
* An Edge Lambda is used to proxy refresh token requests and store them in HTTP only encrypted cookies

### SSL Certificates

* Certificates in the certs folder originate from the [OAuth Development Certificates](https://github.com/gary-archer/oauth.developmentcertificates) repository
