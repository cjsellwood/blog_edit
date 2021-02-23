import React from "react";
import {Redirect} from "react-router-dom"

// Auth wrapping component
const Auth = (props) => {
  return (
    <React.Fragment>
      {props.auth.loggedIn ? props.children : <Redirect to="/login"></Redirect>}
    </React.Fragment>
  );
};

export default Auth;
