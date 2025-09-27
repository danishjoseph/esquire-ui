import { inject } from '@angular/core';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { environment } from '../environments/environment';
import { offsetLimitPagination } from '@apollo/client/utilities';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom } from 'rxjs';

export function apolloConfig(): ApolloClientOptions<unknown> {
  const httpLink = inject(HttpLink);
  const oidc = inject(OidcSecurityService);

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  const authLink = setContext(async () => {
    const token = await firstValueFrom(oidc.getAccessToken());
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  const link = ApolloLink.from([
    errorLink,
    authLink,
    httpLink.create({ uri: environment.graphqlUri }),
  ]);

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          customers: offsetLimitPagination(['search']),
          products: offsetLimitPagination(['search']),
        },
      },
    },
  });

  return {
    link,
    cache,
    headers: { Authorization: `Bearer ${oidc.getAccessToken()}` },
  };
}
