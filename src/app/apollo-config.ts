import { inject } from '@angular/core';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { onError } from '@apollo/client/link/error';
import { environment } from '../environments/environment';
import { offsetLimitPagination } from '@apollo/client/utilities';

export function apolloConfig(): ApolloClientOptions<unknown> {
  const httpLink = inject(HttpLink);

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

  const link = ApolloLink.from([errorLink, httpLink.create({ uri: environment.graphqlUri })]);

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
  };
}
