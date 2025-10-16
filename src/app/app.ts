import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Notification } from './shared/components/ui/notification';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notification],
  template: ` <router-outlet /> <app-notification /> `,
})
export class App {}
