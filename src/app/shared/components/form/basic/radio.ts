import { Component, effect, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { noop } from 'rxjs';
import { Label } from './label';

export interface RadioOption<T = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-radio-group',
  standalone: true,
  imports: [ReactiveFormsModule, Label],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: RadioGroup,
      multi: true,
    },
  ],
  template: `
    <div
      class="flex flex-row flex-wrap gap-4 items-center"
      [class.opacity-40]="disabled()"
      [class.cursor-not-allowed]="disabled()"
    >
      @if (label()) {
        <app-label [for]="id()">{{ label() }}</app-label>
      }

      @for (option of options(); track $index) {
        <label
          [class]="
            'flex items-center gap-3 text-sm font-medium cursor-pointer select-none ' +
            (disabled() ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 dark:text-gray-300')
          "
        >
          <input
            type="radio"
            class="sr-only"
            [name]="name()"
            [value]="option.value"
            [checked]="option.value === value()"
            (change)="onSelect(option.value)"
            [disabled]="disabled()"
            (blur)="onTouched()"
          />

          <!-- Circle -->
          <span
            [class]="
              'flex h-5 w-5 items-center justify-center rounded-full border-[1.25px] ' +
              (option.value === value()
                ? 'border-brand-500 bg-brand-500'
                : 'border-gray-300 dark:border-gray-700 bg-transparent') +
              (disabled()
                ? ' bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700'
                : '')
            "
          >
            <span
              [class]="
                'h-2 w-2 rounded-full bg-white ' + (option.value === value() ? 'block' : 'hidden')
              "
            ></span>
          </span>

          {{ option.label }}
        </label>
      }
    </div>
  `,
})
export class RadioGroup implements ControlValueAccessor {
  /** Inputs */
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly name = input<string>('radio-group');
  readonly options = input<RadioOption[], RadioOption[] | string[]>([], {
    transform: (options) =>
      options.map((opt) =>
        typeof opt === 'string'
          ? { value: opt, label: opt }
          : { value: opt.value, label: opt.label },
      ),
  });
  readonly className = input<string>('');
  readonly defaultValue = input<string>('');

  /** Internal state */
  #value = signal<string>('');
  #disabled = signal(false);

  readonly value = this.#value.asReadonly();
  readonly disabled = this.#disabled.asReadonly();

  /** CVA handlers */
  protected onChange: (_: string) => void = noop;
  protected onTouched: () => void = noop;

  constructor() {
    // Automatically select default value if defined
    effect(() => {
      if (!this.#value() && this.defaultValue()) {
        this.#value.set(this.defaultValue());
        this.onChange(this.defaultValue());
      }
    });
  }

  /** Called when user selects a value */
  onSelect(newValue: string): void {
    if (!this.disabled()) {
      this.#value.set(newValue);
      this.onChange(newValue);
    }
  }

  /** CVA: Write from form control */
  writeValue(value: string | null): void {
    this.#value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.#disabled.set(isDisabled);
  }
}
