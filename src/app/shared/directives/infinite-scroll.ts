import { Directive, output, inject, ElementRef, afterRenderEffect } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
})
export class InfiniteScroll {
  readonly scrolled = output();
  #elementRef = inject(ElementRef);

  constructor() {
    let observer: IntersectionObserver | null = null;

    afterRenderEffect((onCleanup) => {
      observer?.disconnect();
      observer = null;

      if (this.#elementRef) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.length > 0 && entries[0].isIntersecting) {
              this.scrolled.emit();
            }
          },
          { threshold: 0.1 },
        );

        observer.observe(this.#elementRef.nativeElement);

        onCleanup(() => observer?.disconnect());
      }
    });
  }
}
