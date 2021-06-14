# OAuth Final SPA

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

### Overview

An OpenID Connect secured SPA, which aims for a [Web Architecture](https://authguidance.com/2017/09/08/goal-1-spas/) with best capabilities.\
The SPA interacts with an [OAuth Proxy API](https://github.com/gary-archer/oauth.webproxyapi) as part of a `Back End for Front End` solution.

### OAuth Classes

- The [SPA WebAuthenticator Class](https://github.com/gary-archer/oauth.websample.final/blob/master/spa/src/plumbing/oauth/web/webAuthenticator.ts) demonstrates the technically simple front end security
- The [Proxy API Authorizer Class](https://github.com/gary-archer/oauth.webproxyapi/blob/master/src/core/services/authorizer.ts) provides an outline of the more complex back end security

### Deployed Solution

Any reader can sign in to the Deployed SPA via the [Quick Start Page](https://authguidance.com/home/code-samples-quickstart/):

- AWS CloudFront is used as the SPA's Content Delivery Network
- The OAuth Proxy API runs as a Serverless Lambda and is called via AWS API Gateway
- The SPA uses a separate [Business API](https://github.com/gary-archer/oauth.apisample.serverless) for its application data
- AWS Cognito is used as the default low cost Authorization Server

### Blog Posts

- See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
- See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on how to run the code
- See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment) post for details on Cloudfront deployment
- See the [Final HTTP Messages](https://authguidance.com/2020/05/24/spa-and-api-final-http-messages) for details on OAuth and cookie requests

### Same Site Cookies

The Proxy API writes a cookie storing a refresh token, which the SPA sends during OAuth requests.\
The cookie has these properties to ensure good security and to limit the scope of the Proxy API:

- HTTP Only
- Secure
- AES 256 encrypted
- SameSite = strict
- Domain = .authsamples.com
- Path = /proxy/spa

Cookies are only used during calls to the Proxy API at https://api.authsamples.com/proxy/spa. \
They are not used during requests for Web or API resources, so that the SPA's is mainly cookieless.

### Access Tokens in the Browser

The sample keeps options open about use of access tokens in the browser.\
This can potentially enable more advanced cross domain and cross application scenarios.

The SPA sends the same site cookie to the Proxy API to get an access token, then calls business APIs with tokens.\
The SPA only uses tokens in direct HTTPS calls to APIs, and the following behaviour is avoided:

- Storing tokens in HTML5 storage
- Sending tokens between iframes
- Returning tokens to the SPA as a login result

The SPA also uses a Content Security Policy to restrict domains that could read or receive tokens.\
Future standards may further strengthen use of tokens in the browser.

### Variations

Many companies may prefer to double hop all API calls via the Proxy API, so that Javascript can never read tokens.\
This could be easily achieved by adding a [generic proxy middleware](https://github.com/chimurai/http-proxy-middleware) to the Proxy API.

From a development viewpoint it might seem more convenient to include the OAuth Proxy API logic in the Web Host.\
This mixes Web and API concerns though, and could make use of a Content Delivery Network more difficult.
