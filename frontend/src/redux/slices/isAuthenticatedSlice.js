"use client";
import { createSlice } from "@reduxjs/toolkit";
export const isAuthenticatedSlice = createSlice({
  initialState: false,
  name: "isAuthenticated",
  reducers: {
    setIsAuthenticated: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});

export const { setIsAuthenticated } = isAuthenticatedSlice.actions;
export default isAuthenticatedSlice.reducer;
