"use client";
import { createSlice } from "@reduxjs/toolkit";
export const userIdSlice = createSlice({
  initialState: "",
  name: "userId",
  reducers: {
    setUserId: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setUserId } = userIdSlice.actions;
export default userIdSlice.reducer;
