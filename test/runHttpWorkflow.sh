#!/bin/bash

##############################################################
# A script to act as the SPA and call Serverless deployed APIs
##############################################################

WEB_BASE_URL='https://web.authsamples.com'
TOKEN_HANDLER_BASE_URL='https://api.authsamples.com/tokenhandler'
BUSINESS_API_BASE_URL='https://api.authsamples.com/api'
LOGIN_BASE_URL='https://login.authsamples.com'
COOKIE_PREFIX=mycompany
TEST_USERNAME='guestuser@mycompany.com'
TEST_PASSWORD=GuestPassword1
SESSION_ID=$(uuidgen)
RESPONSE_FILE=test/response.txt
#export HTTPS_PROXY='http://127.0.0.1:8888'

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ..

#
# A simple routine to get a header value from an HTTP response file
# The sed expression matches everything after the colon, after which we return this in group 1
#
function getHeaderValue(){
  local _HEADER_NAME=$1
  local _HEADER_VALUE=$(cat $RESPONSE_FILE | grep -i "^$_HEADER_NAME" | sed -r "s/^$_HEADER_NAME: (.*)$/\1/i")
  local _HEADER_VALUE=${_HEADER_VALUE%$'\r'}
  echo $_HEADER_VALUE
}

#
# Similar to the above except that we read a cookie value from an HTTP response file
# This currently only supports a single cookie in each set-cookie header, which is good enough for my purposes
#
function getCookieValue(){
  local _COOKIE_NAME=$1
  local _COOKIE_VALUE=$(cat $RESPONSE_FILE | grep -i "set-cookie: $_COOKIE_NAME" | sed -r "s/^set-cookie: $_COOKIE_NAME=(.[^;]*)(.*)$/\1/i")
  local _COOKIE_VALUE=${_COOKIE_VALUE%$'\r'}
  echo $_COOKIE_VALUE
}

#
# Act as the SPA by sending an OPTIONS request, then verifying that we get the expected results
#
echo "*** Session ID is $SESSION_ID"
echo "*** Requesting cross origin access"
HTTP_STATUS=$(curl -i -s -X OPTIONS "$TOKEN_HANDLER_BASE_URL/login/start" \
-H "origin: $WEB_BASE_URL" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ "$HTTP_STATUS" != '200'  ] && [ "$HTTP_STATUS" != '204' ]; then
  echo "*** Problem encountered requesting cross origin access, status: $HTTP_STATUS"
  exit
fi

#
# Act as the SPA by calling the token handler to start a login and get the request URI
#
echo "*** Creating login URL ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/login/start" \
-H "origin: $WEB_BASE_URL" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered starting a login, status: $HTTP_STATUS"
  exit
fi

#
# Get data we will use later
#
JSON=$(tail -n 1 $RESPONSE_FILE)
AUTHORIZATION_REQUEST_URL=$(jq -r .authorizationRequestUri <<< "$JSON")
STATE_COOKIE=$(getCookieValue "$COOKIE_PREFIX-state")

#
# Next invoke the redirect URI to start a login
#
echo "*** Following login redirect ..."
HTTP_STATUS=$(curl -i -L -s "$AUTHORIZATION_REQUEST_URL" -o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered using the OpenID Connect authorization URL, status: $HTTP_STATUS"
  exit
fi

#
# Get data we will use in order to post test credentials and automate a login
# The Cognito CSRF cookie is written twice due to following the redirect, so get the second occurrence
#
LOGIN_POST_LOCATION=$(getHeaderValue 'location')
COGNITO_XSRF_TOKEN=$(getCookieValue 'XSRF-TOKEN' | cut -d ' ' -f 2)

#
# We can now post a password credential, and the form fields used are Cognito specific
#
echo "*** Posting credentials to sign in the test user ..."
HTTP_STATUS=$(curl -i -s -X POST "$LOGIN_POST_LOCATION" \
-H "origin: $LOGIN_BASE_URL" \
--cookie "XSRF-TOKEN=$COGNITO_XSRF_TOKEN" \
--data-urlencode "_csrf=$COGNITO_XSRF_TOKEN" \
--data-urlencode "username=$TEST_USERNAME" \
--data-urlencode "password=$TEST_PASSWORD" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '302' ]; then
  echo "*** Problem encountered posting a credential to AWS Cognito, status: $HTTP_STATUS"
  exit
fi

#
# Next get the response URL
#
AUTHORIZATION_RESPONSE_URL=$(getHeaderValue 'location')

#
# Next we end the login by asking the server to do an authorization code grant
#
echo "*** Finishing the login by processing the authorization code ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/login/end" \
-H "origin: $WEB_BASE_URL" \
-H 'content-type: application/json' \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
--cookie "$COOKIE_PREFIX-state=$STATE_COOKIE" \
-d '{"url":"'$AUTHORIZATION_RESPONSE_URL'"}' \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered ending a login, status: $HTTP_STATUS"
  exit
fi

#
# Get data that we will use later
#
JSON=$(tail -n 1 $RESPONSE_FILE)
ANTI_FORGERY_TOKEN=$(jq -r .antiForgeryToken <<< "$JSON")
ACCESS_COOKIE=$(getCookieValue "$COOKIE_PREFIX-at")
REFRESH_COOKIE=$(getCookieValue "$COOKIE_PREFIX-rt")
ID_COOKIE=$(getCookieValue "$COOKIE_PREFIX-id")
CSRF_COOKIE=$(getCookieValue "$COOKIE_PREFIX-csrf")

#
# Call the business API with the secure cookie containing an access token
#
echo "*** Calling cross domain API with an access token in the secure cookie ..."
HTTP_STATUS=$(curl -s "$BUSINESS_API_BASE_URL/companies" \
-H "origin: $WEB_BASE_URL" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered calling the API with an access token, status: $HTTP_STATUS"
  exit
fi

#
# Call the business API with an invalid secure cookie, where one character has been tampered with
#
INVALID_COOKIE='AaVdsn3HfasYYCpebpRJ9aB3kLR7b8Z9HfFmfHtHchmNhVM7pAJZZExAGRA-1N2tzbHzzeuYoaGQxHmOf2anINsp1jAftlTU6eC05kgYb3W2rEaeCJk9PmCixUxi_GZKfnhFhJWJNXFf4063wH-F7CKixLkd6KXMDMWm-pmH0wsMQv50G1bBdBxB_qSugjHAygKgPGr77RQUu7PsG923UpLN0rRdpzRMnItCJmQSj7JNY-z031OuYuT_uTIlokzCfqhxCdw4JoQhNfHHCIPasB9QvBiojfjK7aqBffr_M2G0EjWkE35N1S8Z6jrFP7QgvVcTpyRpsYNs1LoZms4g8424J41LkNflxllxDu_areOBl2NDDVm-EddmrmT2NJeclS7RrOom2ouszYlUkuyj-drAchG_1_3g7cBrA9RoYEdaqDv8dEdphWlAUnVL9mab7jykhGOmoX0SZTgC6vXHvHFibrDSbsYFHvnAhiAxnri9gXqMrIwFIVb5pZ62G2XZAtL9k78IVCEW3rJ-LoDLyGl0-21F6zAU6dO0SENNHfM2bpwtPLZieRaIMkzgnI1RbxiNAKPeKS7EPZ0RlD08rI5XcfS_QBySRXbzBYA1-my-rBrqNcSZGyK8iVgH-e9LfCDL_KL_LSCNSEf53IsSNlbb6cPtT4hsjE0-wcM56WDbIzLrirKCmo1vKwyDGbGhB3pDmsfwteUC2vgUiOAI0uPKs7CfNsf97Oez4YsOq5-_QD9GrQfd5ceKvw8YhKLO0tm3R1PLgfApDMj6spWKmNWh3vQxWLaaXA6Yxsk_aBSZ4hLJFVCHSWfocVgfEdodV8SSGV-hWcVOMO78cuz0nLXDPrU8KOOsBpX2gkwyk5-tS-Cf2Z2wk8FA9q1iqoslgY0cTg87VcQClP4LS_GHEpyjJuzEooNKaiJxvWvu9C3AlrBXC6m8_CnsFnXacJxXDtaC169li36dedrzjGG2kKyii0v3u2yB0Z-Owf8zhBbQnHln55kqQ5g718xjq84KtTD42E2-VdSovFtHU-VmtMFnjBitKgT99CeP4Zqvsm3BSleTi_x8dPY_c2ugOdf_3ajvGsdaIp5EWp1LLUVUCpgvyvntYkVv563f2knufxd6qo7ftEz3vBNk5lnP0LgzkNaBdKIcbXwbB5vZWBmD-AtrZeBFXunlhX9sWh2g4kE5LBU7Q0r8EYqDj42aNZX5oBMA2wZZSu_EKgwLz3Clnyi-Sy5rzqBu05J1lzZuhpN2eRd7y5DPaYLV5Yu8XpbP0pCvUEhOI9ZY8NTKkjCG9mcZRvllskRoCfDQ6z6IkOOx_n7EulOMokeDuHf48F5MsKyQVp4UZXsb4p-Br7bfkzgldtxodgALd9pZ6EqE_HeFJ-yUxRbnF_mN7YrqVPLzzzRqu2Cd3um_1LmgPCN8K9bBmeeW0AqbgAFKGn_-9qMpZPE9Gmhg_-WYg7XrJersTjcOvqwVL1bRLzwKd3g7QxdDjqnKFFWDgVrkOBoxMMp2PownH-D8HUyxPX0XqmVIzoyFm4PlC5nNNkv5T6ZJ4XaNPo4jxxXJ'
echo "*** Calling cross domain API with an invalid access token in the secure cookie ..."
HTTP_STATUS=$(curl -s "$BUSINESS_API_BASE_URL/companies" \
-H "origin: $WEB_BASE_URL" \
--cookie "$COOKIE_PREFIX-at=$INVALID_COOKIE" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '401' ]; then
  echo "*** Calling the API with an invalid access token cookie did not result in the expected error, status was: $HTTP_STATUS"
  exit
fi

#
# Next expire the access token in the secure cookie, for test purposes
#
echo "*** Expiring the access token ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/expire" \
-H "origin: $WEB_BASE_URL" \
-H 'content-type: application/json' \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-H "x-$COOKIE_PREFIX-csrf: $ANTI_FORGERY_TOKEN" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE;$COOKIE_PREFIX-rt=$REFRESH_COOKIE;$COOKIE_PREFIX-id=$ID_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-d '{"type":"access"}' \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '204' ]; then
  echo "*** Problem encountered expiring the access token, status: $HTTP_STATUS"
  exit
fi
ACCESS_COOKIE=$(getCookieValue "$COOKIE_PREFIX-at")

#
# Call the business with the expired access token cookie
#
echo "*** Calling cross domain API with an expired access token in the secure cookie ..."
HTTP_STATUS=$(curl -s "$BUSINESS_API_BASE_URL/companies" \
-H "origin: $WEB_BASE_URL" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '401' ]; then
  echo "*** The expected 401 did not occur when calling the API with an expired access token, status: $HTTP_STATUS"
  exit
fi

#
# Next try to refresh the access token
#
echo "*** Calling refresh to get a new access token ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/refresh" \
-H "origin: $WEB_BASE_URL" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-H "x-$COOKIE_PREFIX-csrf: $ANTI_FORGERY_TOKEN" \
--cookie "$COOKIE_PREFIX-rt=$REFRESH_COOKIE;$COOKIE_PREFIX-id=$ID_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '204' ]; then
  echo "*** Problem encountered refreshing the access token, status: $HTTP_STATUS"
  exit
fi
ACCESS_COOKIE=$(getCookieValue "$COOKIE_PREFIX-at")
REFRESH_COOKIE=$(getCookieValue "$COOKIE_PREFIX-rt")
ID_COOKIE=$(getCookieValue "$COOKIE_PREFIX-id")

#
# Call the business API again with the new access token
#
echo "*** Calling cross domain API with a new access token in the secure cookie ..."
HTTP_STATUS=$(curl -s "$BUSINESS_API_BASE_URL/companies" \
-H "origin: $WEB_BASE_URL" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered calling the API with an access token, status: $HTTP_STATUS"
  exit
fi

#
# Next expire both the access token and refresh token in the secure cookies, for test purposes
#
echo "*** Expiring the refresh token ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/expire" \
-H "origin: $WEB_BASE_URL" \
-H 'content-type: application/json' \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-H "x-$COOKIE_PREFIX-csrf: $ANTI_FORGERY_TOKEN" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE;$COOKIE_PREFIX-rt=$REFRESH_COOKIE;$COOKIE_PREFIX-id=$ID_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-d '{"type":"refresh"}' \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '204' ]; then
  echo "*** Problem encountered expiring the refresh token, status: $HTTP_STATUS"
  exit
fi
ACCESS_COOKIE=$(getCookieValue "$COOKIE_PREFIX-at")
REFRESH_COOKIE=$(getCookieValue "$COOKIE_PREFIX-rt")

#
# Call the business API again with the new access token
#
echo "*** Calling cross domain API with an expired access token in the secure cookie ..."
HTTP_STATUS=$(curl -s "$BUSINESS_API_BASE_URL/companies" \
-H "origin: $WEB_BASE_URL" \
--cookie "$COOKIE_PREFIX-at=$ACCESS_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '401' ]; then
  echo "*** The expected 401 did not occur when calling the API with an expired access token, status: $HTTP_STATUS"
  exit
fi

#
# Next try to refresh the token and we should get an invalid_grant error
#
echo "*** Trying to refresh the access token when the session is expired ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/refresh" \
-H "origin: $WEB_BASE_URL" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-H "x-$COOKIE_PREFIX-csrf: $ANTI_FORGERY_TOKEN" \
--cookie "$COOKIE_PREFIX-rt=$REFRESH_COOKIE;$COOKIE_PREFIX-id=$ID_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '401' ]; then
  echo "*** The expected 401 error did not occur, status: $HTTP_STATUS"
  exit
fi

#
# Next make a logout request
#
echo "*** Calling logout to clear cookies and get the end session request URL ..."
HTTP_STATUS=$(curl -i -s -X POST "$TOKEN_HANDLER_BASE_URL/logout" \
-H "origin: $WEB_BASE_URL" \
-H 'accept: application/json' \
-H 'x-mycompany-api-client: httpTest' \
-H "x-mycompany-session-id: $SESSION_ID" \
-H "x-$COOKIE_PREFIX-csrf: $ANTI_FORGERY_TOKEN" \
--cookie "$COOKIE_PREFIX-rt=$REFRESH_COOKIE;$COOKIE_PREFIX-id=$ID_COOKIE;$COOKIE_PREFIX-csrf=$CSRF_COOKIE" \
-o $RESPONSE_FILE -w '%{http_code}')
if [ $HTTP_STATUS != '200' ]; then
  echo "*** Problem encountered calling logout, status: $HTTP_STATUS"
  exit
fi

#
# The real SPA will then do a logout redirect with this URL
#
JSON=$(tail -n 1 $RESPONSE_FILE)
END_SESSION_REQUEST_URL=$(jq -r .endSessionRequestUri <<< "$JSON")
