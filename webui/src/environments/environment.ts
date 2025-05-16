export const environment = {
  oidcConfig: {
    authority: 'https://iam-e70e9f27dba3.europe-west4.edgeflare.dev',
    client_id: 'public-webui',
    redirect_uri: 'https://fabreview.edgeflare.io/signin/callback',
    response_type: 'code',
    scope: 'openid profile email audience:server:client_id:oauth2-proxy',
    post_logout_redirect_uri: 'https://fabreview.edgeflare.io',
    automaticSilentRenew: true,
    silentRequestTimeoutInSeconds: 30,
    silent_redirect_uri: 'https://fabreview.edgeflare.io/silent-refresh-callback.html',
  },
  fabricProxy: 'https://oidc-proxy-fabreview.europe-west4.edgeflare.dev',
  couchdb: 'https://peer0org1-couchdb-fabreview.europe-west4.edgeflare.dev',
  chaincode: {
    channelId: 'default',
    name: 'fabreviewccv1',
  },
  domainSuffix: 'fabreview.europe-west4.edgeflare.dev',
};
