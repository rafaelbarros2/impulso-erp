import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const tenantResolver: ResolveFn<string> = (route) => {
  const platformId = inject(PLATFORM_ID);
  const t = route.queryParamMap.get('tenant');
  if (t) return t;
  if (isPlatformBrowser(platformId)) {
    try { return localStorage.getItem('tenant') || 'demo'; } catch { return 'demo'; }
  }
  return 'demo';
};

