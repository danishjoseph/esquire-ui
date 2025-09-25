import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from '../../shared/components/ui/button';
import { TextArea } from '../../shared/components/form/basic/text-area';
import { Select, Option } from '../../shared/components/form/basic/select';

enum LogType {
  DIAGNOSIS = 'DIAGNOSIS',
  UPDATE = 'UPDATE',
  QA = 'QA',
  FEEDBACK = 'FEEDBACK',
}

export interface IWorkLog {
  ticket_id: FormControl<string | null>;
  created_by: FormControl<string | null>;
  log_type: FormControl<NonNullable<LogType>>;
  log_message: FormControl<string | null>;
}

export interface IWorkLogForm {
  ticket_id: FormControl<string>;
  work_logs: FormArray<FormGroup<IWorkLog>>;
}

@Component({
  selector: 'app-worklog-form',
  imports: [ReactiveFormsModule, TextArea, Button, Select],
  template: `
    <form [formGroup]="form" (ngSubmit)="handleFormSubmit()">
      <div formArrayName="work_logs">
        @for (
          workLog of form.controls.work_logs.controls;
          track worklogIndex;
          let worklogIndex = $index
        ) {
          <div [formGroupName]="worklogIndex" class="grid grid-cols-1 space-y-6 mb-6">
            <app-button
              class="flex justify-end-safe"
              size="xs"
              className="hover:text-error-500"
              [startIcon]="deleteIcon"
              variant="outline"
              (btnClick)="removeLog(worklogIndex)"
            />
            <app-select
              id="log_type"
              label="Log Type"
              placeholder="Enter Log Type"
              formControlName="log_type"
              [options]="workLogTypeOptions"
            />
            <app-text-area
              id="log_message"
              [rows]="4"
              label="Log Message"
              placeholder="Enter Log Message"
              formControlName="log_message"
            />
          </div>
        }
      </div>
      <app-button
        size="xs"
        variant="outline"
        [startIcon]="addIcon"
        class="flex justify-end mt-4"
        (btnClick)="addLog()"
      >
        Add New Log
      </app-button>
    </form>
  `,
})
export class WorklogForm {
  protected fb = inject(NonNullableFormBuilder);
  protected searchIcon = `<svg class="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" fill=""></path></svg>`;
  readonly deleteIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
  readonly addIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10.0002H15.0006M10.0002 5V15.0006" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>`;

  protected form = this.fb.group<IWorkLogForm>({
    ticket_id: this.fb.control('asdfas'),
    work_logs: this.fb.array<FormGroup<IWorkLog>>([]),
  });

  readonly workLogTypeOptions: Option[] = [
    { value: LogType.DIAGNOSIS, label: 'Diagnosis' },
    { value: LogType.UPDATE, label: 'Update' },
    { value: LogType.QA, label: 'QA' },
    { value: LogType.FEEDBACK, label: 'Feedback' },
  ];

  addLog() {
    const newWorkLog = this.fb.group<IWorkLog>({
      ticket_id: this.fb.control('', Validators.required),
      created_by: this.fb.control('', Validators.required),
      log_type: this.fb.control(LogType.DIAGNOSIS, Validators.required),
      log_message: this.fb.control('', Validators.required),
    });
    this.form.controls.work_logs.push(newWorkLog);
  }

  removeLog(index: number) {
    this.form.controls.work_logs.removeAt(index);
  }

  handleFormSubmit() {
    console.log('form values', this.form.value, 'valid', this.form.valid);
  }
}
