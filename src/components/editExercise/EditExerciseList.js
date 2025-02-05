import React, { useEffect } from 'react';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  fetchAllExercises,
  selectExercises,
  selectStatus,
  selectError
} from '../../redux/exercisesSlice';
import {
  fetchSavedExercise
} from '../../redux/addExerciseSlice';


function EditExerciseList({ exercises, status, error, fetchAllExercises, fetchSavedExercise }) {
  useEffect(() => {
      fetchAllExercises();
  }, [fetchAllExercises]);

  let content = null;
  if (status === 'loading') {
    content = <Spinner animation="border" variant="primary" />;
  } else if (status === 'succeeded') {
    let exercises_list = exercises.map((x) => (
      <ListGroup.Item
        as={Link} to={`/edit/${x.exercise_id}`} key={x.exercise_id}
        action
        onClick={() => fetchSavedExercise(x.exercise_id)}
      >
        { x.title }
      </ListGroup.Item>
    ));
    content = <ListGroup>{ exercises_list }</ListGroup>;
  } else if (status === 'failed') {
    content = (
      <Alert variant="danger">
        { error }
      </Alert>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Edit exercises</h1>
      { content }
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    exercises: selectExercises(state),
    status: selectStatus(state),
    error: selectError(state),
  };
};

const mapDispatchToProps = { fetchAllExercises, fetchSavedExercise };

export default connect(mapStateToProps, mapDispatchToProps)(EditExerciseList);
