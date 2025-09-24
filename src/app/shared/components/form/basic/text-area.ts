import { Component, forwardRef, Input, input, model, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Label } from './label';
import { noop } from 'rxjs';

@Component({
  selector: 'app-text-area',
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
      <textarea
        [placeholder]="placeholder()"
        [rows]="rows()"
        [value]="value()"
        (input)="onInput($event)"
        [disabled]="disabled()"
        [class]="textareaClasses"
        (blur)="onTouched()"
      ></textarea>
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
export class TextArea implements ControlValueAccessor {
  readonly id = input.required<string>();
  readonly label = input<string>('');
  readonly placeholder = input('Enter your message');
  readonly success = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly disabled = model<boolean>(false);
  readonly hint = input<string>();
  readonly className = input<string>('');
  readonly rows = input(3);

  #value = signal<string>('');
  readonly value = this.#value.asReadonly();

  protected onChange: (_: string) => void = noop;
  protected onTouched: () => void = noop;

  onInput(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.#value.set(val);
    this.onChange(val);
  }

  get textareaClasses(): string {
    let base = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${this.className()} `;
    if (this.disabled()) {
      base +=
        'bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed opacity40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    } else if (this.error()) {
      base +=
        'bg-transparent border-gray-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800';
    } else {
      base +=
        'bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800';
    }
    return base;
  }

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
    this.disabled.set(isDisabled);
  }
}
