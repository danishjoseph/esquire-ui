import { Directive, TemplateRef, ViewContainerRef, input, inject, effect } from '@angular/core';
import { UserRole } from '../../settings/users/user-resource';
import { AuthRoleService } from '../../settings/users/auth-role-service';

@Directive({
  selector: '[appHasRole]',
})
export class HasRole {
  appHasRole = input.required<UserRole>();

  #tpl = inject(TemplateRef<any>);
  #vcr = inject(ViewContainerRef);
  #roleService = inject(AuthRoleService);

  #visible = false;

  constructor() {
    effect(() => {
      const allowed = this.#roleService.hasRole(this.appHasRole());

      if (allowed && !this.#visible) {
        this.#vcr.clear();
        this.#vcr.createEmbeddedView(this.#tpl);
        this.#visible = true;
      } else if (!allowed && this.#visible) {
        this.#vcr.clear();
        this.#visible = false;
      }
    });
  }
}
