import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit';
import {fetchData} from "./fetchData";
import { Buffer } from 'buffer';

const debugAccessRights = false // todo


/* async actions */

export const logIn = createAsyncThunk(
  'user/login',
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      let data = {};
      data["username"] = username;
      data["password"] = password;
      let response = await dispatch(fetchData(
          `/api/users/login`, 'POST', data
      ));

      return response;
    } catch (err) {
      console.error(err)
      return rejectWithValue(err.message);
    }
  }
);
export const logInByGithub = createAsyncThunk(
  'user/loginGithub',
  async ( {code, token}, { dispatch, rejectWithValue }) => {
    try {
      let data = {};
      if (code !== undefined) {
        data["code"] = code;
      } else if (token !== undefined) {
        data["token"] = token;
      }
      let response = await dispatch(fetchData(
          `/api/users/login/github/auth`, 'POST', data
      ));
      return response;
    } catch (err) {
      console.error(err.message)
      return rejectWithValue(err.message);
    }
  }
);


/* slice */
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    isAdmin: false,
    user: null,

    status: 'idle',
    error: null,

    usernameValue: '',
    passwordValue: ''
  },
  reducers: {
    updateUsername: (state, action) => {
      state.usernameValue = action.payload;
    },
    updatePassword: (state, action) => {
      state.passwordValue = action.payload;
    },
    logOut: (state) => {
      localStorage.removeItem("formalization_checker_token");
      state.isLoggedIn = false;
      state.user = null;
      state.status = 'idle';
      state.error = '';
    },
    setUser: (state) => {
      let data = JSON.parse(Buffer.from(localStorage.getItem("formalization_checker_token").split(".")[1], "base64").toString());
      state.user = {"username": data.username};
      state.isLoggedIn = true;
      state.isAdmin = debugAccessRights || data.isAdmin;
    },
  },
  extraReducers: {
    [logIn.pending]: (state, action) => {
      state.status = 'loading';
    },
    [logIn.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.usernameValue = '';
      state.passwordValue = '';
      if (action.payload) {
        let data = JSON.parse(Buffer.from(action.payload.token.split(".")[1], "base64").toString());
        state.user = {"username": data.username};
        state.isLoggedIn = true;
        state.isAdmin = data.isAdmin;
        localStorage["formalization_checker_token"] = action.payload.token
      } else {
        state.error = '';
      }
    },
    [logIn.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = 'No such combination of username and password found.';
    } ,
    [logInByGithub.pending]: (state, action) => {
      state.status = 'loading';
    },
    [logInByGithub.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.usernameValue = '';
      state.passwordValue = '';
      if (action.payload) {
        let data = JSON.parse(Buffer.from(action.payload.token.split(".")[1], "base64").toString());
        state.user = {"username": data.username};
        state.isLoggedIn = true;
        state.isAdmin = debugAccessRights || data.isAdmin;
        localStorage.setItem("formalization_checker_token", action.payload.token);
      } else {
        state.error = '';
      }
    },
    [logInByGithub.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = 'No such combination of username and password found.';
    } ,
  }
});

/* export actions */
export const selectUser = (state) => {
  return state.user.user?.username;
}

export const {
  updateUsername,
  updatePassword,
  logOut,
  setUser
} = userSlice.actions;

export default userSlice.reducer;
