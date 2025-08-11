import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';

export const listFadeSlide = trigger('listFadeSlide', [
  transition(':enter', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(60, animate('220ms cubic-bezier(.2,0,0,1)', style({ opacity: 1, transform: 'none' })))
    ], { optional: true })
  ])
]);

export const hoverPulse = trigger('hoverPulse', [
  state('void', style({ transform: 'scale(1)' })),
  state('hover', style({ transform: 'scale(1.01)' })),
  transition('void <=> hover', animate('120ms cubic-bezier(.2,0,0,1)'))
]);
