import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userList: [],
  selectedPerson: null,
  selectedUser: null,
};

export const calenderSlice = createSlice({
  name: "calender",
  initialState,
  reducers: {
    setUserList: (state, action) => {
      state.userList = action.payload;
    },
    setSelectedPerson: (state, action) => {
      state.selectedPerson = action.payload;
    },
    setCalenderView: (state, action) => {
      state.calenderView = action.payload;
    },
    setUserWorkingHours: (state, action) => {
      state.userWorkingHours = action.payload;
    },
  },
});

export const { setUserList, setSelectedPerson, setCalenderView, setAllUsers,setUserWorkingHours } =
  calenderSlice.actions;

export const selectUserList = (state) => state.calender.userList;
export const selectSelectedPerson = (state) => state.calender.selectedPerson;
export const selectCalenderView = (state) => state.calender.calenderView;
export const selectUserWorkingHours = (state) => state.calender.userWorkingHours;

export default calenderSlice.reducer;
