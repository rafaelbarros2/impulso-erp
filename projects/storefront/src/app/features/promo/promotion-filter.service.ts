import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class PromotionFilterService { private _category$ = new BehaviorSubject<string | null>(null); readonly category$ = this._category$.asObservable(); setCategory(slug: string | null) { this._category$.next(slug); } }
