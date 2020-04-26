import React from 'react';
import PropTypes from 'prop-types';
import './App.css';
import socketIOClient from 'socket.io-client';

const axios = require('axios');

class Title extends React.Component {

  static get propTypes() {
    return {
      name: PropTypes.string.isRequired
    };
  }

  render() {
    return (
      <div className={'chatApp__convTitle'}>{this.props.name} Chat Room</div>
    );
  }
}

/* InputMessage component - used to type the message */
class InputMessage extends React.Component {

  static get propTypes() {
    return {
      sendMessageLoading: PropTypes.func.isRequired,
      isLoading: PropTypes.bool.isRequired,
    };
  }

  constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    /* Disable sendMessage if the message is empty */
    if (this.messageInput.value.length > 0) {
      this.props.sendMessageLoading(
        this.userInput.value,
        this.userAvatarInput.value,
        this.messageInput.value,
      );
      /* Reset input after send*/
      this.messageInput.value = '';
    }
  }

  render() {
    /* If the chatbox state is loading, loading class for display */
    const loadingClass = this.props.isLoading ?
      'chatApp__convButton--loading' :
      '';
    const sendButtonIcon = <i className={'material-icons'}>send</i>;
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          ref={(message) => (this.messageInput = message)}
          className={'chatApp__convInput'}
          placeholder="Text message"
          tabIndex="0"
        />
        <input type="submit" style={{ display: 'none' }} />
        <div
          className={'chatApp__convButton ' + loadingClass}
          onClick={this.handleSubmit}
        >
          {sendButtonIcon}
        </div>
        <input
          className={'chatApp_usernameForm'}
          id="username"
          type="text"
          placeholder="Username"
          autoComplete="off"
          ref={(user) => (this.userInput = user)}
        />
        <input
          className={'chatApp_profilePicForm'}
          type="text"
          id="profile_picture"
          placeholder="Profile Picture URL"
          ref={(userAvatar) => (this.userAvatarInput = userAvatar)}
        />
      </form>
    );
  }
}
/* end InputMessage component */
/* ========== */

/* ========== */
/* MessageItem component - composed of a message and the sender's avatar */
class MessageItem extends React.Component {

  static get propTypes() {
    return {
      user: PropTypes.object.isRequired,
      sender: PropTypes.string.isRequired,
      senderAvatar: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    };
  }

  render() {
    /* message position formatting - right if I'm the author */
    // TODO: user is object. need to add username field
    const messagePosition =
      this.props.user === this.props.sender ?
        'chatApp__convMessageItem--right' :
        'chatApp__convMessageItem--left';

    return (
      <div
        className={'chatApp__convMessageItem ' + messagePosition + ' clearfix'}
      >
        <div className={'chatApp_messageOwner'}>{this.props.sender}</div>
        <img
          src={this.props.senderAvatar}
          alt={this.props.sender}
          className="chatApp__convMessageAvatar"
        />
        <div
          className="chatApp__convMessageValue"
          dangerouslySetInnerHTML={{ __html: this.props.message }}
        ></div>
      </div>
    );
  }
}
/* end MessageItem component */
/* ========== */

/* ========== */
/* MessageList component - contains all messages */
class MessageList extends React.Component {

  static get propTypes() {
    return {
      messages: PropTypes.array.isRequired,
      user: PropTypes.object.isRequired,
    };
  }

  render() {
    return (
      <div className={'chatApp__convTimeline'}>
        {this.props.messages
          .slice(0)
          .reverse()
          .map((messageItem) => (
            <MessageItem
              key={messageItem.id}
              user={this.props.user}
              sender={messageItem.sender}
              senderAvatar={messageItem.senderAvatar}
              message={messageItem.message}
            />
          ))}
      </div>
    );
  }
}
/* end MessageList component */
/* ========== */

/* ========== */
/* ChatBox component - composed of Title, MessageList, TypingIndicator, InputMessage */
class ChatBox extends React.Component {

  static get propTypes() {
    return {
      endpoint: PropTypes.string.isRequired,
      roomId: PropTypes.string.isRequired,
      roomName: PropTypes.string.isRequired,
      user: PropTypes.object.isRequired,
    };
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isLoading: false,
      messages: [],
    };
    this.chatSocket = socketIOClient(this.props.endpoint);
    this.sendMessage = this.sendMessage.bind(this);
    this.sendMessageLoading = this.sendMessageLoading.bind(this);
  }

  componentDidMount() {
    this.chatSocket.emit('join', { roomId: this.props.roomId });
    this.chatSocket.on('message', (message) => {
      console.log(message);
      this.setState({
        messages: [...this.state.messages, message],
      });
    });

    axios.get('/api/messages/' + this.props.roomId)
      .then((response) => {
        if (response.data !== null) {
          this.setState({ messages: response.data });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  /* adds a new message to the chatroom */
  sendMessage(sender, senderAvatar, message, roomId) {
    const messageFormat = detectURL(message);

    if (sender === '') {
      sender = 'Anon';
    }

    if (senderAvatar === '') {
      senderAvatar = 'https://i.imgur.com/JIHZl1g.png';
    }

    const newMessageItem = {
      sender: sender,
      senderAvatar: senderAvatar,
      message: messageFormat,
      roomId: roomId,
    };

    this.chatSocket.emit('message', newMessageItem);
  }

  /* catch the sendMessage signal and update the loading state then continues the sending instruction */
  sendMessageLoading(sender, senderAvatar, message) {
    this.setState({ isLoading: true });
    this.sendMessage(sender, senderAvatar, message, this.props.roomId);
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 400);
  }

  render() {
    return (
      <div className={'chatApp__conv'}>
        <Title name={this.props.roomName} />
        <MessageList user={this.props.user} messages={this.state.messages} />
        <div className={'chatApp__convSendMessage clearfix'}>
          <InputMessage
            isLoading={this.state.isLoading}
            sendMessage={this.sendMessage}
            sendMessageLoading={this.sendMessageLoading}
          />
        </div>
      </div>
    );
  }
}
/* end ChatBox component */
/* ========== */

class App extends React.Component {
  render() {
    const rooms = {};
    const chatBoxes = [];

    // TODO: Define user profile on top level and pass in here
    const user = {
      name: 'Anon',
      avatar: 'https://i.imgur.com/JIHZl1g.png'
    };

    /* Group details - can add as many groups as desired */
    rooms[0] = {
      name: 'Gaming',
      roomId: 'gaming',
      endpoint: '/chat',
      user: user,
    };
    rooms[1] = {
      name: 'Testing',
      roomId: 'testing',
      endpoint: '/chat',
      user: user,
    };

    /* creation of a chatbox for each user present in the chatroom */
    Object.keys(rooms).map(function (key) {
      const room = rooms[key];
      return chatBoxes.push(
        <ChatBox
          key={key}
          roomName={room.name}
          roomId={room.roomId}
          endpoint={room.endpoint}
          user={room.user}
        />,
      );
    });
    return <div className={'chatApp__room'}>{chatBoxes}</div>;
  }
}

/* detect url in a message and add a link tag */
function detectURL(message) {
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  return message.replace(urlRegex, function (urlMatch) {
    return '<a href="' + urlMatch + '">' + urlMatch + '</a>';
  });
}

export default App;
