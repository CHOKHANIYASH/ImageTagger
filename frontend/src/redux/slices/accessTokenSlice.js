"use client";
import { createSlice } from "@reduxjs/toolkit";
export const accessTokenSlice = createSlice({
  name: "accessToken",
  initialState: "",
  reducers: {
    setAccessToken: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setAccessToken } = accessTokenSlice.actions;
export default accessTokenSlice.reducer;
