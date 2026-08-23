import { configureStore } from "@reduxjs/toolkit";
import { reducers } from "./reducers";
import { api as cardApi } from "./slices/cardApi";
import { LookUpAPI } from "./slices/lookupGraphSlice";
import { globalApi } from "./slices/globalApi";
import navbarSettingsReducer from "./slices/navbarSettingsSlice";

export const store = configureStore({
  reducer: {
    ...reducers,
    navbarSettings: navbarSettingsReducer,
    [cardApi.reducerPath]: cardApi.reducer,
    [LookUpAPI.reducerPath]: LookUpAPI.reducer,
    [globalApi.reducerPath]: globalApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(cardApi.middleware)
      .concat(LookUpAPI.middleware)
      .concat(globalApi.middleware),
});
