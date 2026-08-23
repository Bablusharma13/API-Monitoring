// src/redux/navbarSettingsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profileSettingItems: [],
  loading: false,
};

const navbarSettingsSlice = createSlice({
  name: "navbarSettings",
  initialState,
  reducers: {
    setProfileSettingItems: (state, action) => {
      state.profileSettingItems = action.payload;
    },
    setNavbarLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearProfileSettings: (state) => {
      state.profileSettingItems = [];
      state.loading = false;
    },
  },
});

export const {
  setProfileSettingItems,
  setNavbarLoading,
  clearProfileSettings,
} = navbarSettingsSlice.actions;
export default navbarSettingsSlice.reducer;
