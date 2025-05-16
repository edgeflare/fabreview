export const environment = {
  oidcConfig: {
    // authority: 'http://127.0.0.1:5556/dex',
    authority: 'https://iam-e70e9f27dba3.europe-west4.edgeflare.dev',
    client_id: 'public-webui',
    redirect_uri: 'http://localhost:4200/signin/callback',
    response_type: 'code',
    scope: 'openid profile email audience:server:client_id:oauth2-proxy',
    post_logout_redirect_uri: 'http://localhost:4200',
    automaticSilentRenew: true,
    silentRequestTimeoutInSeconds: 30,
    silent_redirect_uri: 'http://localhost:4200/silent-refresh-callback.html',
  },
  // fabricProxy: 'http://localhost:7059/api/v1',
  fabricProxy: 'https://oidc-proxy-fabreview.europe-west4.edgeflare.dev',
  couchdb: 'https://peer0org1-couchdb-fabreview.europe-west4.edgeflare.dev',
  chaincode: {
    channelId: 'default',
    name: 'fabreviewccv1',
  },
  domainSuffix: 'fabreview.europe-west4.edgeflare.dev',
};
