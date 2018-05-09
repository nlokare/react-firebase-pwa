import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import Header from "./Header";

export default class ChatContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { newMessage: ""};
  }

  componentDidMount() {
    this.scrollToBottom();
  }
  
  componentDidUpdate(previousProps) {
    if (previousProps.messages.length !== this.props.messages.length) {
      this.scrollToBottom();
    }
  }

  handleLogout() {
    firebase.auth().signOut();
  }

  handleInputChange = (e) => {
    this.setState({newMessage: e.target.value});
  }

  handleSubmit = () => {
    // onSubmit is going to be a function passed as props from App.js
    this.props.onSubmit(this.state.newMessage);
    this.setState({newMessage: ""});
  }

  handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleSubmit();
    }
  }

  getAuthor = (msg, nextMsg) => {
    if (!nextMsg || nextMsg.author !== msg.author) {
      return (
        <p className="author">
          <Link to={`/users/${msg.user_id}`}>{msg.author}</Link>
        </p>
      );
    }
  }

  scrollToBottom = () => {
      const messageContainer = ReactDOM.findDOMNode(this.messageContainer);
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
  }
  
  render() {
    return (
      <div id="ChatContainer" className="inner-container">
        <Header>
          <button className="red" onClick={this.handleLogout}>Logout</button>
        </Header>
        {this.props.messagesLoaded ?  (
          <div 
            id="message-container"
            ref={element => {
              this.messageContainer = element;
            }}
          >
            {this.props.messages.map((msg, i) => ( 
                <div 
                  key={msg.id} 
                  className={`message ${this.props.user.email === msg.author && 'mine'}`}>
                  <p>{msg.msg}</p>
                  {this.getAuthor(msg, this.props.messages[i + 1])}
                </div>
            ))}
          </div>
      ) : (
        <div id="loading-container">
          <img src="/assets/icon.png" alt="logo" id="loader" />
        </div>
      )}
        <div id="chat-input">
            <textarea 
              placeholder="Add your message..."
              onChange={this.handleInputChange}
              onKeyDown={this.handleKeyDown}
              value={this.state.newMessage}
            />
            <button onClick={this.handleSubmit}>
              <svg viewBox="0 0 24 24">
                <path fill="#424242" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
          </button>
        </div>
      </div>
    );
  }
};

/*
The <button> component is passed as props to the Header component and will display only if it exists
The to prop on the Link uses ES6 string interpolation. If you wrap your string in backticks (`) instead of quotation marks, you can use ${VARIABLE} to embed variables right into it.
We can add a ref to any JSX element we want to use later (that we want to refer to later). Let's add one to our message container. 
The ref prop is always a function, which is called with the element in question, and then used to assign that element to a property of the component.
*/
