import { inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment.development';

export function apolloConfig(): ApolloClientOptions<unknown> {
  const httpLink = inject(HttpLink);
  return {
    link: httpLink.create({ uri: environment.graphqlUri }),
    cache: new InMemoryCache(),
  };
}
