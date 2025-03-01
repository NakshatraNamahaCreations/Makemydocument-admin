import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    clear: false
};

const clrSlice = createSlice({
    name: "clr",
    initialState,
    reducers: {
        setClr: (state, action) => {
            state.clear = action.payload;
        }
    }
});

export const { setClr } = clrSlice.actions;
export default clrSlice.reducer;
