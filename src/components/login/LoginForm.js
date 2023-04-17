import React, {useEffect} from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import {
    updateUsername, updatePassword, logIn, logInByGithub, setUser
} from '../../redux/userSlice';
import {CLIENT_ID, REDIRECT} from "../../config";


function LoginForm({
  usernameValue, passwordValue, updateUsername, updatePassword, setUser,
  location, isLoggedIn, status, error, logIn, logInByGithub
}) {
    useEffect(() => {
        if (localStorage.getItem("formalization_checker_token") !== null) {
            setUser();
        }
    }, [status, setUser]);

  if (status === 'loading') {
    return <Spinner animation="border" variant="primary" />;
  }
  if(window.location.href.match("code")){
      let code = window.location.href.split("code=")[1];
      logInByGithub({code: code});
      return <Redirect to="/" />
  }

  if (isLoggedIn) {
    if (location.state && location.state.from && location.state.from.pathname) {
      return <Redirect to={location.state.from.pathname} />
    } else {
      return <Redirect to="/" />
    }
  } else {

    return (
      <Form>
        <Form.Group>
          <Form.Label>
            Username
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={usernameValue}
            onChange={(e) => updateUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>
            Password
          </Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={passwordValue}
            onChange={(e) => updatePassword(e.target.value)}
          />
          <Form.Text className="text-danger">
            { error }
          </Form.Text>
        </Form.Group>
        <Button
          type="submit"
          style={{marginTop: 0.5+'em', marginBottom: 0.5+'em', marginRight: 0.5+'em'}}
          onClick={(e) => {
            e.preventDefault();
            logIn({ username: usernameValue, password: passwordValue });
          }}
        >
          Log in
        </Button>
        <Button
          type="submit"
          style={{marginTop: 0.5+'em', marginBottom: 0.5+'em', marginLeft: 0.5+'em'}}
          onClick={(e) => {
            e.preventDefault();
              let url = "https://github.com/login/oauth/authorize?client_id=" + CLIENT_ID + "&redirect_uri=" + REDIRECT +"&scope=read:user"
              window.location.replace(url);
          }}
        >
          Log in with Github
        </Button>
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    usernameValue: state.user.usernameValue,
    passwordValue: state.user.passwordValue,
    isLoggedIn: state.user.isLoggedIn,
    status: state.user.status,
    error: state.user.error
  };
};

const mapDispatchToProps = { updateUsername, updatePassword, logIn, logInByGithub, setUser };

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
