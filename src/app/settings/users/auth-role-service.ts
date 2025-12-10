import { Injectable, computed, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserRole } from '../../settings/users/user-resource';

@Injectable({ providedIn: 'root' })
export class AuthRoleService {
  private oidc = inject(OidcSecurityService);

  private idToken = toSignal(this.oidc.getPayloadFromIdToken());

  roles = computed<UserRole[]>(() => {
    const payload = this.idToken();
    if (!payload) return [];

    const groups = payload['cognito:groups'] ?? [];

    return groups as UserRole[];
  });

  hasRole = (role: UserRole) => {
    return this.roles().includes(role);
  };
}
