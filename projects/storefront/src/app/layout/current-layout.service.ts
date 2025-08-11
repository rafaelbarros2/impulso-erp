import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn:'root' })
export class CurrentLayoutService {
  private _id$ = new BehaviorSubject<string>('classic');
  readonly id$ = this._id$.asObservable();

  constructor(@Inject(DOCUMENT) private doc: Document,
              @Inject(PLATFORM_ID) private pid: Object) {}

  set(id: string, vars?: Record<string,string>) {
    this._id$.next(id);
    this.doc.documentElement.setAttribute('data-layout', id);
    // aplica CSS vars no <html> (lado do cliente)
    if (isPlatformBrowser(this.pid) && vars) {
      const style = this.doc.documentElement.style;
      for (const [k,v] of Object.entries(vars)) style.setProperty(k, v);
    }
  }
}
