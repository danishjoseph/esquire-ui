import { Component, input } from '@angular/core';

@Component({
  selector: 'app-label',
  imports: [],
  template: `
    <label
      [attr.for]="for()"
      [class]="'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400 ' + className()"
    >
      <ng-content></ng-content>
    </label>
  `,
})
export class Label {
  readonly for = input();
  readonly className = input();
}
