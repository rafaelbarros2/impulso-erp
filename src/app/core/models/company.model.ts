import { BaseEntity } from './core.model';

export interface Company extends BaseEntity {
  id: number;
  name: string;
  isSubsidiary: boolean;
  parentCompanyId?: number;
}
