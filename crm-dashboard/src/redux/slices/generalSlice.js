import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  setting: null,
  loading:true
};

export const generalSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    setSetting: (state, action) => {
      state.setting = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});
export const selectSetting = (state) => state.setting.setting;
export const { setSetting } = generalSlice.actions;

export default generalSlice.reducer;
