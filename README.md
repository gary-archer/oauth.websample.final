# OAuth Final SPA

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

## Overview

The final demo SPA, which aims for a [Web Architecture](https://authguidance.com/2017/09/08/goal-1-spas/) with best capabilities:

- The SPA uses an API driven OpenID Connect solution via **Curity's Token Handler Pattern**
- Only client side React technology is needed to implement the SPA, for productive development
- The SPA is deployed to many global locations via a Content Delivery Network

## Deployed System

You can login to the online version by following the instructions in the [Quick Start Page](https://authguidance.com/home/code-samples-quickstart/).

## Quick Start

Ensure that Node.js installed, then run the following script from a macOS terminal or from Git Bash on Windows:

```bash
./build.sh
```

Custom development domains are used so you must add this entry to your hosts file:

```
127.0.0.1 web.authsamples-dev.com
::1       localhost
```

Trust the root certificate that the build step downloads to your computer, so that SSL works in the browser.\
Add this file to the system keychain on macOS or the Windows certificate trust store for the local computer:

```
./webhost/certs/authsamples-dev.ca.pem
```

Then deploy components if required, to run the SPA on the local computer:

```bash
./deploy.sh
```

The browser is invoked at `https://web.authsamples-dev.com/spa` and you can sign in with these credentials:

- User: `guestuser@mycompany.com`
- Password: `GuestPassword1`

You can then test all lifecycle operations, including token refresh, multi-tab browsing and multi-tab logout.

## Further Information

Further architecture and non-functional details are described starting in the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) blog post.

## Cloud Infrastructure Used

* AWS Route 53 is used for custom hosting domains
* AWS S3 is used as the upload point for web static content
* AWSA Cloudfront is used to distribute web static content to enable globally equal web performance
* AWS Certificate Manager is used to manage and auto renew the Web Host's SSL certificate
* AWS Cognito is used as the default Authorization Server
* AWS deployed [Backend for Frontend Components](https://authguidance.com/2019/09/09/spa-back-end-for-front-end) are used to perform OAuth and cookies issuing work for the SPA

