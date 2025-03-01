import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from "./loaderSlice";
import cclrReducer from "./clrSlice";



const store = configureStore({
  reducer: {
    loader: loaderReducer,
    clr:cclrReducer

  },

});

export default store;