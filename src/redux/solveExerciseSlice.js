import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit';
import {
  parseConstants,
  parsePredicates,
  parseFunctions,
  parseFormulaWithPrecedence
} from '@fmfi-uk-1-ain-412/js-fol-parser';
import { fetchData } from './fetchData';
import {
  arrayToArityMap,
  parseFormalization
} from './helpers';


/* async actions */

export const fetchExercise = createAsyncThunk(
  'solveExercise/fetchExercise',
  async ({exercise_id, user_name}, { dispatch, rejectWithValue }) => {
    try {
      let response = await dispatch(fetchData(
        `/api/exercises/${exercise_id}`, 'POST', { username: user_name}
      ));
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const evaluate = createAsyncThunk(
  'solveExercise/evaluate',
  async ({ exercise_id, proposition_id, solution, user }, { dispatch, rejectWithValue }) => {
    try {
      let response = await dispatch(fetchData(
        `/api/exercises/${exercise_id}/${proposition_id}`, 'POST',
        { solution, user }
      ));
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const feedback = createAsyncThunk(
  'solveExercise/feedback',
  async ({ proposition_id }, { rejectWithValue }) => {
    try {
      let response = await fetchData(
        `/api/exercises/feedback/${proposition_id}`, 'GET');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


/* slice */
export const solveExerciseSlice = createSlice({
  name: 'solveExercise',
  initialState: {
    exercise: null,
    status: 'idle',
    error: null,

    constants: [],
    predicates: [],
    functions: [],

    solutions: {}
  },
  reducers: {
    update: {
      reducer: (state, action) => {
        const { value, id } = action.payload;
        state.solutions[id].solution = value;
      },
      prepare: (value, id) => {
        return { payload: { value, id } };
      }
    }
  },
  extraReducers: {
    [fetchExercise.pending]: (state, action) => {
      state.status = 'loading';
    },
    [fetchExercise.fulfilled]: (state, action) => {
      state.status = 'succeeded';
      state.exercise = action.payload;
      state.constants = parseConstants(state.exercise.constants);
      state.predicates = parsePredicates(state.exercise.predicates);
      state.functions = parseFunctions(state.exercise.functions);
      for (let p of state.exercise.propositions) {
        state.solutions[p.proposition_id] = {
          evaluation: null,
          status: 'idle',
          error: null,
          feedback: null,
          f_status: 'idle',
          f_error: null
        };
        if(p.solution === null || p.solution === undefined){
          state.solutions[p.proposition_id]["solution"] = '';
        }
        else{
          state.solutions[p.proposition_id]["solution"] = p.solution
        }
      }
    },
    [fetchExercise.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    [evaluate.pending]: (state, action) => {
      let { proposition_id } = action.meta.arg;
      let solution = state.solutions[proposition_id];
      solution.status = 'loading';
    },
    [evaluate.fulfilled]: (state, action) => {
      let { proposition_id } = action.meta.arg;
      let evaluation = action.payload;
      let solution = state.solutions[proposition_id];
      solution.status = 'succeeded';
      solution.evaluation = evaluation;
    },
    [evaluate.rejected]: (state, action) => {
      let { proposition_id } = action.meta.arg;
      let { error } = action.payload;
      let solution = state.solutions[proposition_id];
      solution.status = 'failed';
      solution.error = error;
    },
    [feedback.pending]: (state, action) => {
      let { proposition_id } = action.meta.arg;
      let solution = state.solutions[proposition_id];
      solution.f_status = 'loading';
    },
    [feedback.fulfilled]: (state, action) => {
      let { proposition_id } = action.meta.arg;
      let feedback = action.payload;
      let solution = state.solutions[proposition_id];
      solution.f_status = 'succeeded';
      solution.feedback = feedback;
    },
    [feedback.rejected]: (state, action) => { // todo, asi zmenit
      let { proposition_id } = action.meta.arg;
      let { error } = action.payload;
      let solution = state.solutions[proposition_id];
      solution.f_status = 'failed';
      solution.f_error = error;
    }
  }
});


/* export actions */
export const {
  update
} = solveExerciseSlice.actions;


/* selectors */

export const selectExercise = (state) => {
  return state.solveExercise.exercise;
};

export const selectSolution = (state, id) => {
  const value = state.solveExercise.solutions[id].solution;
  let error = parseFormalization(
    value, new Set(state.solveExercise.constants),
    arrayToArityMap(state.solveExercise.predicates),
    arrayToArityMap(state.solveExercise.functions),
    parseFormulaWithPrecedence
  );
  return { value, error };
};

export const selectStatus = (state) => {
  return state.solveExercise.status;
};

export const selectError = (state) => {
  return state.solveExercise.error;
};

export const selectEvaluation = (state, id) => {
  return state.solveExercise.solutions[id].evaluation;
};

export const selectEvalStatus = (state, id) => {
  return state.solveExercise.solutions[id].status;
};

export const selectEvalError = (state, id) => {
  return state.solveExercise.solutions[id].error;
};

export const selectFeedbacks = (state, id) => {
  return state.solveExercise.solutions[id].feedback;
};


export const selectFeedbacksStatus = (state, id) => {
  return state.solveExercise.solutions[id].f_status;
};

export const selectFeedbacksError = (state, id) => {
  return state.solveExercise.solutions[id].f_error;
};

export default solveExerciseSlice.reducer;
