export interface ValidationState {
  hasErrors: boolean;
  fieldErrors: Record<string, string>;
  generalErrors: string[];
}
