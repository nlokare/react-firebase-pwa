import React, { Component } from "react";
import Header from "./Header";

class LoginContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { email: "", password: "", error: "" };
  }

  handleEmailChange = (event) => {
    this.setState({email: event.target.value});
  }

  handlePasswordChange = (event) => {
    this.setState({password: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({error: ""});
    if (this.state.email && this.state.password) {
      this.login();
    } else {
      this.setState({error: "Please fill in both fields."});
    }
  }

  login() {
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(res => {
        this.onLogin();
      })
      .catch(err => {
        if (err.code === "auth/user-not-found") {
          this.signUp();
        } else {
          this.setState({err: "Error logging in."});
        }
    });
  }

  signUp() {
    firebase
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(res => {
        this.onLogin();
      })
      .catch(err => {
        console.log(err);
        this.setState({err: "Error signing up."});
      });
  }

  onLogin() {
    this.props.history.push("/");
  }

  render() {
    return (
      <div id="LoginContainer" className="inner-container">
        <Header />
        <form onSubmit={this.handleSubmit}>
          <p>Sign in or sign up by entering your email and password</p>
          <input 
            type="text" 
            placeholder="Your email" 
            onChange={this.handleEmailChange}
            value={this.state.email} />
          <input 
            type="password" 
            placeholder="Your password" 
            onChange={this.handlePasswordChange}
            value={this.state.password} />
          <p className="error">{this.state.error}</p>
          <button className="red light" type="submit">Login</button>
        </form> 
      </div>
    );
  }
};

export default LoginContainer;
