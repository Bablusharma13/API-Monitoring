import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  userToken: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setToken: (state, action) => {
      state.userToken = action.payload;
    },
  },
});

export const { setUser, setToken } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.userToken;

export default userSlice.reducer;
