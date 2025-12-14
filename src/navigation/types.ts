/**
 * Navigation type definitions for the app
 */

export type RootTabParamList = {
  Financials: undefined;
  Tasks: undefined;
  Groceries: undefined;
  Schedule: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
