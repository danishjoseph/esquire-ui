import { Component, inject, input, model, signal } from '@angular/core';
import { Badge, BadgeColor } from '../shared/components/ui/badge';
import { ProductCategory, ProductList, ProductResource } from './product-resource';
import { Button } from '../shared/components/ui/button';
import { productCategoryOptions } from './product-form';
import { ProductModal } from './product-modal';

@Component({
  selector: 'app-product-table',
  imports: [Badge, Button, ProductModal],
  template: `
    <table class="min-w-full">
      <thead
        class="px-6 py-3.5 border-t border-gray-100 border-y bg-gray-50 dark:border-white/[0.05] dark:bg-gray-900"
      >
        <tr>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Serial No
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Name
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Category
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Brand
          </th>
          <th
            class="px-6 py-3 font-medium text-gray-500 sm:px-6 text-theme-xs dark:text-gray-400 text-start"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        @for (row of data(); track $index) {
          <tr>
            <td class="px-4 sm:px-6 py-3.5">
              <div class="flex items-center gap-3">
                <div>
                  <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                    {{ row.serialNumber }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <span class="mb-0.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
                {{ row.name }}
              </span>
            </td>
            <td class="px-4 sm:px-6 py-3.5 min-w-40">
              <app-badge size="sm" [color]="getBadgeColor(row.category)">
                {{ categoryInfoMap[row.category].label || 'Unknown Category' }}
              </app-badge>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <p class="text-gray-700 text-theme-sm dark:text-gray-400">
                {{ row.brand }}
              </p>
              <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                {{ row.modelName }}
              </span>
            </td>
            <td class="px-4 sm:px-6 py-3.5">
              <span class="flex items-center w-full gap-4">
                <app-button
                  size="xs"
                  className="hover:text-blue-light-500"
                  variant="outline"
                  [startIcon]="viewIcon"
                  (btnClick)="updateProduct(row.id.toString())"
                />
                <app-button
                  size="xs"
                  className="hover:text-error-500"
                  variant="outline"
                  [startIcon]="deleteIcon"
                  (btnClick)="deleteProduct(row.id.toString())"
                >
                </app-button>
              </span>
            </td>
          </tr>
        }
      </tbody>
    </table>
    <app-product-modal [isOpen]="isOpen()" [productId]="productId()" (closed)="closeModal()" />
  `,
})
export class ProductTable {
  data = input.required<ProductList[]>();
  categoryOptions = productCategoryOptions;

  readonly viewIcon = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-700 cursor-pointer size-4 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-500"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 4.5C7.80517 4.5 4.50422 7.28231 3 11C4.50422 14.7177 7.80517 17.5 12 17.5C16.1948 17.5 19.4958 14.7177 21 11C19.4958 7.28231 16.1948 4.5 12 4.5ZM12 15.5C9.51472 15.5 7.5 13.4853 7.5 11C7.5 8.51472 9.51472 6.5 12 6.5C14.4853 6.5 16.5 8.51472 16.5 11C16.5 13.4853 14.4853 15.5 12 15.5ZM12 9C10.6193 9 9.5 10.1193 9.5 11.5C9.5 12.8807 10.6193 14 12 14C13.3807 14 14.5 12.8807 14.5 11.5C14.5 10.1193 13.3807 9 12 9Z" fill="currentColor"></path></svg>`;
  readonly deleteIcon = `<svg width="1em" height="1em" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="size-4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

  protected productResource = inject(ProductResource);

  protected productId = model('');
  protected isOpen = signal(false);

  openModal(id: string) {
    this.productId.set(id);
    this.isOpen.set(true);
  }

  closeModal() {
    this.productId.set('');
    this.isOpen.set(false);
  }

  updateProduct(id: string) {
    this.openModal(id);
  }

  deleteProduct(id: string) {
    this.productResource.remove(id).subscribe();
  }

  categoryInfoMap: Record<ProductCategory, { label: string; color: BadgeColor }> = {
    [ProductCategory.NORMAL_LAPTOP]: { label: 'Normal Laptop', color: 'success' },
    [ProductCategory.GAMING_LAPTOP]: { label: 'Gaming Laptop', color: 'primary' },
    [ProductCategory.TABLET]: { label: 'Tablet', color: 'info' },
    [ProductCategory.NORMAL_DESKTOP_CPU]: { label: 'Normal Desktop CPU', color: 'light' },
    [ProductCategory.GAMING_CPU]: { label: 'Gaming CPU', color: 'dark' },
    [ProductCategory.MONITORS]: { label: 'Monitors', color: 'warning' },
    [ProductCategory.UPS]: { label: 'UPS', color: 'error' },
    [ProductCategory.IPG_PRODUCTS]: { label: 'IPG Products', color: 'success' },
    [ProductCategory.ACCESSORIES]: { label: 'Accessories', color: 'primary' },
    [ProductCategory.CCTV_DVR_NVR]: { label: 'CCTV DVR/NVR', color: 'warning' },
    [ProductCategory.CCTV_CAMERA]: { label: 'CCTV Camera', color: 'dark' },
    [ProductCategory.SMPS]: { label: 'SMPS', color: 'info' },
    [ProductCategory.OTHERS]: { label: 'Others', color: 'light' },
  };

  getBadgeColor(category: ProductCategory): BadgeColor {
    return this.categoryInfoMap[category].color ?? 'light';
  }
}
