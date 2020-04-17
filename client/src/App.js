import React, { Component } from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: 'localhost:4000/chat',
      message: '',
      room: 'gaming',
    };

    this.chatSocket = socketIOClient(this.state.endpoint);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.chatSocket.emit('join', {roomId: this.state.room});
    this.chatSocket.on('message', function(msg){
      // add message to list
    });
  }

  handleSubmit(event) {
    event.preventDefault(); // prevents page reloading
    console.log('message sent clicked');
    console.log(this.state.message);
    this.chatSocket.emit('message', {roomId: this.state.room, payload: this.state.message});
  }

  handleChanged(event) {
    this.setState({message: event.target.value});
  }

  render() {
    return (
        <div>
          <ul id="messages"></ul>
          <form action="" onSubmit={this.handleSubmit}>
            <input id="m" autoComplete="off" value={this.state.message} onChange={this.handleChanged} />
            <input id="submit" type="submit" value="Submit" />
          </form>
        </div>
    );
  }
}

export default App;