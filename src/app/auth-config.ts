import { PassedInitialConfig } from 'angular-auth-oidc-client';
import { environment } from '../environments/environment';

export const authConfig: PassedInitialConfig = {
  config: {
    authority: environment.authority,
    redirectUrl: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    clientId: environment.clientId,
    scope: 'email openid phone',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    customParamsEndSessionRequest: {
      client_id: environment.clientId,
      logout_uri: window.location.origin,
    },
  },
};
