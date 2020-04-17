import React, { Component } from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';

class App extends Component {
  constructor() {
    super();
    // this.state = {
    //   response: false,
    //   endpoint: '/chat',
    //   message: '',
    //   room: 'gaming',
    // };
    this.state = {
      messages: [],
      roomId: 'gaming',
      endpoint: '/chat'
    }
    this.chatSocket = socketIOClient(this.state.endpoint)
    this.sendMessage = this.sendMessage.bind(this)
  }

  componentDidMount() {
    this.chatSocket.emit('join', {roomId: this.state.roomId});
    this.chatSocket.on('message', (message) => {
      console.log("RETRIEVED MESSAGE" + message);
      this.setState({
        messages: [...this.state.messages, message]
      })
    });
  }

  sendMessage(message) {
    this.chatSocket.emit('message', message);
    this.setState({
      messages: [...this.state.messages, message]
    })
  }

  render() {
    return (
        <div className="app">
          <Title />
          <MessageList 
              roomId={this.state.roomId}
              messages={this.state.messages} />
          <SendMessageForm
              sendMessage={this.sendMessage}
              roomId={this.state.roomId} />
        </div>
    );
  }
}

class MessageList extends React.Component {
  render() {
      return (
          <ul className="message-list">
              {this.props.messages.map((message, index) => {
                  return (
                    <li  key={message.id} className="message">
                      <div>{message.senderId}</div>
                      <div>{message.text}</div>
                    </li>
                  )
              })}
          </ul>
      )
  }
}

class SendMessageForm extends React.Component {
  constructor() {
      super()
      this.state = {
          message: '',
          username: ''
      }
      this.handleTextChange = this.handleTextChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleUsernameChange = this.handleUsernameChange.bind(this);
  }
  
  handleTextChange(e) {
      this.setState({
          message: e.target.value,
      })
  }

  handleUsernameChange(e){
    this.setState({
      username: e.target.value,
    })
  }
  
  handleSubmit(e) {
      e.preventDefault();
      this.props.sendMessage({id: -1, roomId: this.props.roomId, senderId: this.state.username, text: this.state.message})
      this.setState({
          message: '',
          username: ''
      })
  }
  
  render() {
      return (
        <div>
          <form
            className="username-form">
            <label>Username</label>
            <input 
              type = "text"
              onChange={this.handleUsernameChange}
              value = {this.state.username} />
          </form>
          <form
              onSubmit={this.handleSubmit}
              className="send-message-form">
              <input
                  onChange={this.handleTextChange}
                  value={this.state.message}
                  placeholder="Type your message and hit ENTER"
                  type="text" />
          </form>
        </div>
      )
  }
}

function Title() {
  return <p className="title">Chat app</p>
}

export default App;