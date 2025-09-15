import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-avatar-text',
  imports: [],
  template: ` <div
    class="flex h-10 w-10 items-center justify-center rounded-full
    {{ colorClass() }} {{ className() }}"
  >
    <span class="text-sm font-medium">{{ initials() }}</span>
  </div>`,
})
export class AvatarText {
  readonly name = input.required<string>();
  readonly className = input('');

  readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  readonly colorClass = computed(() => {
    const colors = [
      'bg-brand-100 text-brand-600',
      'bg-pink-100 text-pink-600',
      'bg-cyan-100 text-cyan-600',
      'bg-orange-100 text-orange-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-error-100 text-error-600',
    ];
    const index = this.name()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  });
}
