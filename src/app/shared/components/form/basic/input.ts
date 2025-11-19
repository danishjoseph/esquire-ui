import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Label } from './label';
import { noop } from 'rxjs';

@Component({
  selector: 'app-input',
  imports: [ReactiveFormsModule, Label],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Input),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <app-label [for]="id()">{{ label() }}</app-label>
    }
    <div class="relative">
      <input
        [id]="id()"
        [name]="id()"
        [class]="inputClasses()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
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
    </div>
  `,
})
export class Input implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly type = input<string>('text');
  readonly label = input<string>('');
  readonly placeholder = input<string | undefined>('');
  readonly success = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly hint = input<string>();
  readonly className = input<string>('');

  #value = signal<string>('');
  #disabled = signal(false);
  readonly value = this.#value.asReadonly();
  readonly disabled = this.#disabled.asReadonly();

  protected onChange: (_: string) => void = noop;
  protected onTouched: () => void = noop;

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    this.#value.set(newValue);
    this.onChange(newValue);
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

  writeValue(value: string | Date) {
    if (value instanceof Date) {
      const formatted = value.toISOString().substring(0, 10);
      this.#value.set(formatted);
    } else {
      this.#value.set(value ?? '');
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
