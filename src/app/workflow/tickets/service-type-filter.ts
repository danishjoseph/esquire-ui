import { Component, model } from '@angular/core';
import { Dropdown } from '../../shared/components/ui/dropdown';
import { Badge, BadgeColor } from '../../shared/components/ui/badge';
import { ServiceType } from './purchase-info-form';

@Component({
  selector: 'app-service-type-filter',
  imports: [Dropdown, Badge],
  template: `
    <app-dropdown class="inline-block relative" className="absolute left-0 z-10">
      <div dropdown-button>
        <button class="text-gray-500 dark:text-gray-400 px-0.5 focus:outline-none">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.83325 5.91699L7.99992 10.0837L12.1666 5.91699"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        </button>
      </div>
      <div dropdown-content>
        @for (serviceType of selectedServiceType(); track $index) {
          <app-badge
            size="sm"
            [endIcon]="closeIcon"
            [color]="serviceTypeMap[serviceType.name].color"
            (iconClick)="removeServiceType($event, serviceType.name)"
          >
            {{ serviceTypeMap[serviceType.name].label }} ( {{ serviceType.count }} )
          </app-badge>
        }
        <!-- @if (removedItems().length) { -->
        <!--   <div class="flex justify-end"> -->
        <!--     <app-button --
        <!--       size="xs" -->
        <!--       variant="transparent" -->
        <!--       [startIcon]="resetIcon" -->
        <!--       (btnClick)="resetSections($event)" -->
        <!--     /> -->
        <!--   </div> -->
        <!-- } -->
      </div>
    </app-dropdown>
  `,
})
export class ServiceTypeFilter {
  readonly selectedServiceType = model.required<{ name: ServiceType; count: number }[]>();
  protected closeIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z" fill="currentColor"></path></svg>`;
  protected resetIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-4"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.72763 4.33443C7.92401 3.6437 9.30836 3.34945 10.6823 3.49385C12.0562 3.63826 13.3491 4.2139 14.3757 5.13828C15.0468 5.74252 15.5815 6.4755 15.9517 7.28815L13.6069 6.49282C13.2147 6.35977 12.7888 6.5699 12.6557 6.96216C12.5227 7.35443 12.7328 7.78028 13.1251 7.91333L16.8227 9.16752C16.8668 9.18743 16.9129 9.20314 16.9605 9.21426L17.0868 9.25712C17.2752 9.32101 17.4813 9.30746 17.6597 9.21943C17.838 9.1314 17.9741 8.97611 18.038 8.78772L19.3816 4.82561C19.5147 4.43334 19.3045 4.0075 18.9122 3.87447C18.52 3.74145 18.0941 3.95161 17.9611 4.34388L17.2335 6.48938C16.783 5.5609 16.1553 4.72223 15.3794 4.02356C14.1174 2.88722 12.528 2.17958 10.839 2.00207C9.15012 1.82455 7.44834 2.18628 5.97763 3.03539C4.50692 3.88451 3.34277 5.17743 2.65203 6.72884C1.9613 8.28025 1.77944 10.0105 2.13252 11.6716C2.4856 13.3328 3.3555 14.8395 4.61753 15.9758C5.87957 17.1121 7.46894 17.8198 9.15788 17.9973C10.8468 18.1748 12.5486 17.8131 14.0193 16.964C14.378 16.7569 14.5009 16.2982 14.2938 15.9395C14.0867 15.5807 13.628 15.4578 13.2693 15.6649C12.0729 16.3557 10.6886 16.6499 9.31467 16.5055C7.94077 16.3611 6.64786 15.7855 5.62123 14.8611C4.5946 13.9367 3.88697 12.711 3.59974 11.3598C3.31252 10.0085 3.46046 8.60098 4.02235 7.33894C4.58424 6.07691 5.53125 5.02516 6.72763 4.33443Z" fill="currentColor"></path></svg>`;

  protected serviceTypeMap: Record<ServiceType, { label: string; color: BadgeColor }> = {
    [ServiceType.INHOUSE]: {
      label: 'Inhouse',
      color: 'primary',
    },
    [ServiceType.OUTDOOR]: { label: 'Outdoor', color: 'info' },
  };

  removeServiceType(event: Event, serviceType: ServiceType) {
    event.stopPropagation();
    this.selectedServiceType.update((serviceTypes) =>
      serviceTypes.filter((t) => t.name !== serviceType),
    );
  }
}
