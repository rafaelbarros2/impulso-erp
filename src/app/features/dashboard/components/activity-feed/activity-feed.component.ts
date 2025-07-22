import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
})
export class ActivityFeedComponent {
  @Input() activities: { icon: string; title: string; subtitle: string; }[] = [];
}