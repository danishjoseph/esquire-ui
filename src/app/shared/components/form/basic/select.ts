import { Component, computed, effect, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Label } from './label';
import { noop } from 'rxjs';

export interface Option {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [ReactiveFormsModule, Label],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: Select,
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <app-label [for]="id()">{{ label() }}</app-label>
    }
    <select
      class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
    {{ value() ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400' }} {{
        className()
      }}"
      [value]="value()"
      (change)="onSelectChange($event)"
      (blur)="onTouched()"
      [disabled]="disabled()"
    >
      <!-- Placeholder option -->
      <option
        value=""
        disabled
        [selected]="!value()"
        class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {{ placeholder() }}
      </option>
      <!-- Map over options -->
      @for (option of options(); track $index) {
        <option
          [value]="option.value"
          [selected]="option.value === this.value()"
          class="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {{ option.label }}
        </option>
      }
    </select>
  `,
})
export class Select implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly options = input<Option[], Option[] | string[]>([], {
    transform: (options) =>
      options.map((opt) =>
        typeof opt === 'string'
          ? { value: opt, label: opt }
          : { value: opt.value, label: opt.label },
      ),
  });
  readonly placeholder = input<string>('Select an option');
  readonly success = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly hint = input<string>();
  readonly className = input<string>('');
  readonly defaultValue = input<string>('');

  constructor() {
    effect(() => {
      if (!this.#value() && this.#value().includes(this.defaultValue())) {
        this.#value.set(this.defaultValue());
      }
    });
  }

  #value = signal<string>('');
  #disabled = signal(false);
  readonly value = this.#value.asReadonly();
  readonly disabled = this.#disabled.asReadonly();

  protected onChange: (_: string) => void = noop;
  protected onTouched: () => void = noop;

  onSelectChange(event: Event): void {
    const input = event.target as HTMLSelectElement;
    const newValue = input.value;
    this.#value.set(newValue);
    this.onChange(newValue);
  }

  readonly inputClasses = computed(() => {
    let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${this.className()}`;

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

  writeValue(value: string) {
    this.#value.set(value ?? '');
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
