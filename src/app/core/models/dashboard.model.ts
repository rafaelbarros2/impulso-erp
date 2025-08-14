export interface DashboardData {
  kpis: KpiData[];
  activities: ActivityData[];
}

export interface KpiData {
  title: string;
  value: string;
  icon: string;
  trend: string;
}

export interface ActivityData {
  type: string;
  message: string;
  time: string;
  amount?: string;
  client?: string;
  product?: string;
}
