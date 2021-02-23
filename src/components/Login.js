import React from "react";

const Login = (props) => {
  return (
    <div>
      <h1 className="title">Login</h1>
      <form onSubmit={props.login} className="form">
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            onChange={props.loginFormInput}
            value={props.loginForm.username}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            onChange={props.loginFormInput}
            value={props.loginForm.password}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
