import { Component, computed, effect, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';
import { Label } from './basic/label';

export interface CountryCode {
  code: string;
  label: string;
}

const DEFAULT_COUNTRY_CODE = [
  { code: '+91', label: 'IN' },
  { code: '+01', label: 'US' },
  { code: '+44', label: 'GB' },
  { code: '+81', label: 'JP' },
  { code: '+49', label: 'DE' },
];

@Component({
  selector: 'app-phone-input',
  imports: [Label],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInput),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <app-label [for]="id()">{{ label() }}</app-label>
    }
    <div class="relative flex">
      <!-- Dropdown position: Start -->
      @if (selectPosition() === 'start') {
        <div class="absolute">
          <select
            [value]="country()"
            (change)="handleCountryChange($event)"
            class="appearance-none bg-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            @for (country of countries(); track $index) {
              <option
                [value]="country.code"
                class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {{ country.label }}
              </option>
            }
          </select>
          <div
            class="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none bg-none right-3 dark:text-gray-400"
          >
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      }

      <!-- Input field -->
      <input
        type="tel"
        [id]="id()"
        [placeholder]="placeholder()"
        [class]="inputClasses()"
        [class]="(selectPosition() === 'start' ? 'pl-[84px]' : 'pr-[84px]') + ' ' + inputClasses()"
        [disabled]="disabled()"
        [value]="phoneNumber()"
        (input)="handlePhoneNumberChange($event)"
        (blur)="onTouched()"
      />

      <!-- Dropdown position: End -->
      @if (selectPosition() === 'end') {
        <div class="absolute right-0">
          <select
            [value]="country()"
            (change)="handleCountryChange($event)"
            class="appearance-none bg-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400"
          >
            @for (country of countries(); track $index) {
              <option
                [value]="country.code"
                class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {{ country.label }}
              </option>
            }
          </select>
          <div
            class="absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400"
          >
            <svg
              className="stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      }
    </div>
    @if (hint()) {
      <p
        class="mt-1.5 text-xs"
        [class]="{
          'text-error-500': error(),
          'text-success-500': success(),
          'text-gray-500': !error() && !success(),
        }"
      >
        {{ hint() }}
      </p>
    }
  `,
})
export class PhoneInput implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly countries = input<CountryCode[]>(DEFAULT_COUNTRY_CODE);
  readonly placeholder = input('+91 9876543210');
  readonly selectPosition = input<'start' | 'end'>('start');
  readonly success = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly hint = input<string>();
  readonly className = input<string>('');

  #country = signal('');
  #phoneNumber = signal('');
  #disabled = signal(false);
  readonly phoneNumber = this.#phoneNumber.asReadonly();
  readonly country = this.#country.asReadonly();
  readonly disabled = this.#disabled.asReadonly();

  countryCodes: Record<string, string> = {};

  constructor() {
    effect(() => {
      if (this.countries().length > 0) {
        this.#country.set(this.countries()[0].code);
        this.countryCodes = this.countries().reduce(
          (acc, { code, label }) => ({ ...acc, [code]: label }),
          {},
        );
      }
    });
  }

  handleCountryChange(event: Event) {
    const newCountry = (event.target as HTMLSelectElement).value;
    this.#country.set(newCountry);
    const combinedPhoneNumber = newCountry + this.phoneNumber();
    this.onChange(combinedPhoneNumber);
  }

  handlePhoneNumberChange(event: Event) {
    const newPhoneNumber = (event.target as HTMLInputElement).value;
    this.#phoneNumber.set(newPhoneNumber);
    const combinedPhoneNumber = this.country() + newPhoneNumber;
    this.onChange(combinedPhoneNumber);
  }

  readonly inputClasses = computed(() => {
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-base md:text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${this.className()}`;

    if (this.disabled()) {
      inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
    } else if (this.error()) {
      inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
    } else if (this.success()) {
      inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
    } else {
      inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
    }
    return inputClasses;
  });

  protected onChange: (_: string) => void = noop;
  protected onTouched: () => void = noop;

  writeValue(value: string | null): void {
    if (value) {
      // Try to find a matching country code
      const matchingCode = this.countries().find(({ code }) => value.startsWith(code));
      if (matchingCode) {
        this.#country.set(matchingCode.code);
        this.#phoneNumber.set(value.substring(matchingCode.code.length));
      } else {
        // No country code found, treat entire value as phone number
        this.#phoneNumber.set(value);
      }
    } else {
      this.#phoneNumber.set('');
    }
  }

  registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.#disabled.set(isDisabled);
  }
}
