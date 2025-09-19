import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModalStore {
  #isOpen = signal(false);

  isOpen = this.#isOpen.asReadonly();

  /** Open the modal */
  openModal(): void {
    this.#isOpen.set(true);
  }

  /** Close the modal */
  closeModal(): void {
    this.#isOpen.set(false);
  }

  /** Toggle the modal */
  toggleModal(): void {
    this.#isOpen.set(!this.#isOpen());
  }
}
