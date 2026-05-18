"use client";

import { Provider } from "react-redux";
import { store } from "@/app/src/redux/store";
import { AuthListener } from "./AuthListener";
import { QueryProvider } from "./QueryProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthListener>{children}</AuthListener>
      </QueryProvider>
    </Provider>
  );
}
