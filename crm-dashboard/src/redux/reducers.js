import userReducer from "./slices/userSlice.js";
import calenderReducer from "./slices/calenderSlice.js";
import settingReducer from "./slices/generalSlice.js";
import ticketReducer from "./slices/ticketSlice.js";
import cardApi from './slices/cardApi.js'
import { globalApi } from "./slices/globalApi.js";
// import clientReducer from "./slices/clientSlice.js"

export const reducers = {
  user: userReducer,
  calender: calenderReducer,
  setting: settingReducer, 
  ticket: ticketReducer,
  [globalApi.reducerPath]: globalApi.reducer,
  // client: clientReducer // Assuming setSetting is a slice with a reducer
};

