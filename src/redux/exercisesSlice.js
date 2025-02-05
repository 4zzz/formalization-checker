import {
    createSlice,
    createAsyncThunk
} from '@reduxjs/toolkit';
import { fetchData } from './fetchData';


/* async actions */

export const fetchAllExercises = createAsyncThunk(
    'exercises/fetchAllExercises',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            let response = await dispatch(fetchData('/api/exercises', 'GET'));
            return response;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

/* slice */
export const exercisesSlice = createSlice({
    name: 'exercises',
    initialState: {
        exercises: [],
        status: 'idle',
        error: null
    },
    reducers: {changeExerciseStatus: {
            reducer: (state, action) => {
                state.status = 'idle';
            }
        },},
    extraReducers: {
        [fetchAllExercises.pending]: (state, action) => {
            state.status = 'loading';
        },
        [fetchAllExercises.fulfilled]: (state, action) => {
            state.status = 'succeeded';
            state.exercises = action.payload;
        },
        [fetchAllExercises.rejected]: (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        }
    }
});

/* export actions */
export const {
    changeExerciseStatus
} = exercisesSlice.actions;

/* selectors */

export const selectExercises = (state) => {
    return state.exercises.exercises;
};

export const selectStatus = (state) => {
    return state.exercises.status;
};

export const selectError = (state) => {
    return state.exercises.error;
};

export default exercisesSlice.reducer;