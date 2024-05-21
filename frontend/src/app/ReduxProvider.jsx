"use client";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "../redux/redux";
import { PersistGate } from "redux-persist/integration/react";

export default function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
