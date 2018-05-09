import React, { Component} from "react";
import { Route, withRouter } from "react-router-dom";
import AsyncComponent from "./AsyncComponent";
import NotificationResource from "../resources/NotificationResource";
import "./app.css";

const loadLogin = () => {
  return import("./LoginContainer").then(module => module.default);
};

const loadChat = () => {
  return import("./ChatContainer").then(module => module.default);
};

 const loadUser = () => {
  return import("./UserContainer").then(module => module.default);
};

const LoginContainer = AsyncComponent(loadLogin);
const ChatContainer = AsyncComponent(loadChat);
const UserContainer = AsyncComponent(loadUser);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: null, messages: [], messagesLoaded: false};
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
        this.notifications.changeUser(user);
      } else {
        this.props.history.push("/login");
      }
    });
    // When a new message is added, we listen for an update from firebase,
    // send the results to the onMessage function, format the messages,
    // save to state, and pass as props to ChatContainer
    firebase
      .database()
      .ref("/messages")
      .on("value", (snapshot) => {
        this.onMessage(snapshot);
        if (!this.state.messagesLoaded) {
          this.setState({messagesLoaded: true});
        }
      });
    this.listenForInstallBanner();
    this.notifications = new NotificationResource(
      firebase.messaging(),
      firebase.database()
    );
    // load other scripts when idle time
    loadChat();
    loadLogin();
    loadUser();
  }

  handleSubmitMessage = (msg) => {
    const data = {
      msg: msg,
      author: this.state.user.email,
      user_id: this.state.user.uid,
      timestampe: Date.now()
    };
    firebase
      .database()
      .ref("/messages/")
      .push(data);
    // after sending a message, show install prompt (Android Only)
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(choice => {
        this.deferredPrompt = null;
      });
    }
  }

  // Chrome on Android only
  listenForInstallBanner = () => {
    window.addEventListener("beforeinstallprompt", (e) => {
      console.log("beforeinstallprompt Event fired");
      e.preventDefault();
      this.deferredPrompt = e; // store for later
    });
  }

  onMessage = (snapshot) => {
    const messages = Object.keys(snapshot.val()).map(key => {
      const msg = snapshot.val()[key];
      msg.id = key;
      return msg;
    });
    this.setState({ messages });
  }

  render() { 
    return (
      <div id="container" className="inner-container">
        <Route path="/login" component={LoginContainer} />
        <Route 
          exact
          path="/"
          render={() => 
            <ChatContainer 
              onSubmit={this.handleSubmitMessage}
              user={this.state.user}
              messages={this.state.messages}
              messagesLoaded={this.state.messagesLoaded}
            />
          }
        />
        <Route 
          path="/users/:id"
          render={({ history, match }) => (
            <UserContainer
              messages={this.state.messages}
              messagesLoaded={this.state.messagesLoaded}
              userID={match.params.id}
            /> 
          )}
        />
      </div>
    );
  }
};

/*
  Note that React Router automatically gives us the history and match props in our render method, which we use here to grab the user ID from the URL parameters.
 */

// using withRouter(App) gives App access to the history props object, simplifying routing (HOC)
export default withRouter(App);
