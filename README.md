# OAuth Final SPA

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

## Overview

The final OpenID Connect secured SPA, which aims for a [Web Architecture](https://authguidance.com/2017/09/08/goal-1-spas/) with best capabilities.\
The SPA interacts with an [OAuth Proxy API](https://github.com/gary-archer/oauth.webproxyapi) as part of a [Back End for Front End](https://authguidance.com/2019/09/09/spa-back-end-for-front-end) solution.

## Instructions

- See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
- See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on the setup 

## Quick Start

Once development domains and SSL are configured, these commands to spin up all components:

```bash
./build.sh
./deploy.sh
```

The SPA connects to AWS Cognito and you can sign in to the SPA with one of these password credentials.\
The UI visualises how a domain specific array claim is used to enforce access to resources:

| User | Password | Comments |
| ---- | -------- | -------- |
| guestuser@mycompany.com | GuestPassword1 | A user with access to a single region |
| guestadmin@mycompany.com | GuestPassword1 | A user with access to multiple regions |

## OAuth Security

- The [SPA WebAuthenticator Class](https://github.com/gary-archer/oauth.websample.final/blob/master/spa/src/plumbing/oauth/web/webAuthenticator.ts) demonstrates simple OAuth code in the SPA
- The [Proxy API Authorizer Class](https://github.com/gary-archer/oauth.webproxyapi/blob/master/src/core/services/authorizer.ts) provides an outline of the more complex back end security

## API Requests

Calls to APIs use SameSite cookies with these properties, so that recommended 2021 browser security is used:

- HTTP Only
- Secure
- AES256 encrypted
- SameSite = strict
- Domain = api.authsamples.com
- Path = /
