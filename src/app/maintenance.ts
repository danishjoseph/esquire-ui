import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  imports: [RouterLink],
  template: `
    <div
      class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1"
    >
      <div class="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 class="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
          Maintenance Mode
        </h1>

        <img src="/images/error/maintenance.svg" alt="Maintenance" class="dark:hidden mx-auto" />
        <img
          src="/images/error/maintenance-dark.svg"
          alt="Maintenance"
          class="hidden dark:block mx-auto"
        />

        <p class="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          Our site is currently undergoing scheduled maintenance. We should be back shortly. Thank
          you for your patience!
        </p>

        <a
          routerLink="/"
          class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Back to Home Page
        </a>
      </div>

      <p
        class="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400"
      >
        &copy; {{ currentYear }} - Esquire
      </p>
    </div>
  `,
  styles: ``,
})
export class Maintenance {
  currentYear: number = new Date().getFullYear();
}
