// Import necessary functions and components
import {
  configureStore,
  getDefaultMiddleware,
  combineReducers,
} from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web
import { persistStore } from "redux-persist";
// import thunk from "redux-thunk";
// Import reducers
import accessTokenReducer from "./slices/accessTokenSlice";
import isAuthenticatedReducer from "./slices/isAuthenticatedSlice";
import userIdReducer from "./slices/userIdSlice";
import refreshTokenReducer from "./slices/refreshTokenSlice";
// import createWebStorage from "redux-persist/lib/storage/createWebStorage";

// const createNoopStorage = () => {
//   return {
//     getItem(_key) {
//       return Promise.resolve(null);
//     },
//     setItem(_key, value) {
//       return Promise.resolve(value);
//     },
//     removeItem(_key) {
//       return Promise.resolve();
//     },
//   };
// };

// const storage =
//   typeof window === "undefined" ? createNoopStorage() : createWebStorage();

// export default storage;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["accessToken", "isAuthenticated", "refreshToken", "userId"], // Specify which parts of the state to persist
};

const rootReducer = combineReducers({
  accessToken: accessTokenReducer,
  refreshToken: refreshTokenReducer,
  userId: userIdReducer,
  isAuthenticated: isAuthenticatedReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with persisted reducers
export const store = configureStore({
  //   reducer: {
  //     accessToken: persistedAccessTokenReducer,
  //     isAuthenticated: persistedIsAuthenticatedReducer,
  //   },
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  //   middleware: [thunk, ...getDefaultMiddleware],
});
export const persistor = persistStore(store);
