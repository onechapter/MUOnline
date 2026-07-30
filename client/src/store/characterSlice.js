import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  characters: [],
  selected: null,
  classes: [],
};

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setCharacters: (state, action) => {
      state.characters = action.payload;
    },
    selectCharacter: (state, action) => {
      state.selected = action.payload;
    },
    setClasses: (state, action) => {
      state.classes = action.payload;
    },
    addCharacter: (state, action) => {
      state.characters.unshift(action.payload);
    },
    removeCharacter: (state, action) => {
      state.characters = state.characters.filter((c) => c._id !== action.payload);
      if (state.selected?._id === action.payload) {
        state.selected = null;
      }
    },
  },
});

export const { setCharacters, selectCharacter, setClasses, addCharacter, removeCharacter } =
  characterSlice.actions;
export default characterSlice.reducer;