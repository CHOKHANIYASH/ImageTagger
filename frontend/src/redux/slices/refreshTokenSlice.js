"use client";
import { createSlice } from "@reduxjs/toolkit";
export const refreshTokenSlice = createSlice({
  initialState: "",
  name: "refreshToken",
  reducers: {
    setRefreshToken: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setRefreshToken } = refreshTokenSlice.actions;
export default refreshTokenSlice.reducer;
