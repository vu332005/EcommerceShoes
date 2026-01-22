"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { hydrateAuth } from "./features/authSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Khi ứng dụng vừa chạy lên, nạp ngay user từ LocalStorage vào Redux
  useEffect(() => {
    store.dispatch(hydrateAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
