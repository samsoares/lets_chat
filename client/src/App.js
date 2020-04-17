import React, { Component } from 'react';
import './App.css';
import socketIOClient from 'socket.io-client';

class Title extends React.Component {
	constructor(props, context) {
		super(props, context);
	}
	render() {
		return (
			<div className={"chatApp__convTitle"}>{this.props.owner}'s display</div>
		);
	}
}

/* ========== */
/* InputMessage component - used to type the message */
class InputMessage extends React.Component {
	constructor(props, context) {
    super(props, context);

    this.handleSubmit = this.handleSubmit.bind(this);
		this.handleTyping = this.handleTyping.bind(this);
  }

  handleSubmit(e) {
      e.preventDefault();
		/* Disable sendMessage if the message is empty */
		if( this.messageInput.value.length > 0 ) {
      this.props.sendMessageLoading(this.ownerInput.value, this.ownerAvatarInput.value, this.messageInput.value);
			/* Reset input after send*/
      this.messageInput.value = '';
    }
  }
  
	handleTyping(event) {
    /* Tell users when another user has at least started to write */
  }
  
	render() {
		/* If the chatbox state is loading, loading class for display */
		var loadingClass = this.props.isLoading ? 'chatApp__convButton--loading' : '';
		let sendButtonIcon = <i className={"material-icons"}>send</i>;
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type="text"
					ref={message => (this.messageInput = message)}
					className={"chatApp__convInput"}
					placeholder="Text message"
					onKeyDown={this.handleTyping}
					onKeyUp={this.handleTyping}
					tabIndex="0"
				/>
        <input type="submit" style={{display:'none'}}/>
				<div className={'chatApp__convButton ' + loadingClass} onClick={this.handleSubmit}>
				{sendButtonIcon}
				</div>
        <input className={"chatApp_usernameForm"}
          id="username"
          type="text"
          placeholder="Username"
          autocomplete="off"
          ref={owner => (this.ownerInput = owner)} />
				<input className={"chatApp_profilePicForm"}
          type="text"
          id="profile_picture"
          placeholder="Profile Picture URL"
					ref={ownerAvatar => (this.ownerAvatarInput = ownerAvatar)}
				/>
			</form>
		);
	}
}
/* end InputMessage component */
/* ========== */

/* ========== */
/* MessageList component - contains all messages */
class MessageList extends React.Component {
	constructor(props, context) {
		super(props, context);
	}
	render() {
		return (
      <div className={"chatApp__convTimeline"}>
      {this.props.messages.slice(0).reverse().map(
        messageItem => (
          <MessageItem
            key={messageItem.id}
            owner={this.props.owner}
            sender={messageItem.sender}
            senderAvatar={messageItem.senderAvatar}
            message={messageItem.message}
          />
        )
      )}
      </div>
		);
	}
}
/* end MessageList component */
/* ========== */

/* ========== */
/* MessageItem component - composed of a message and the sender's avatar */
class MessageItem extends React.Component {
	render() {
		/* message position formatting - right if I'm the author */
		let messagePosition = (( this.props.owner == this.props.sender ) ? 'chatApp__convMessageItem--right' : 'chatApp__convMessageItem--left');
		return (
			<div className={"chatApp__convMessageItem " + messagePosition + " clearfix"}>
        <div className = {"chatApp_messageOwner"}>{this.props.sender}</div>
				<img src={this.props.senderAvatar} alt={this.props.sender} className="chatApp__convMessageAvatar" />
				<div className="chatApp__convMessageValue" dangerouslySetInnerHTML={{__html: this.props.message}}></div>
			</div>
		);
	}
}
/* end MessageItem component */
/* ========== */


/* ========== */
/* ChatBox component - composed of Title, MessageList, TypingIndicator, InputMessage */
class ChatBox extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			isLoading: false
		};
		this.sendMessageLoading = this.sendMessageLoading.bind(this);
		var timeout = null;
	}
	/* catch the sendMessage signal and update the loading state then continues the sending instruction */
	sendMessageLoading(sender, senderAvatar, message) {
		this.setState({ isLoading: true });
		this.props.sendMessage(sender, senderAvatar, message, this.props.roomId);
		setTimeout(() => {
			this.setState({ isLoading: false });
		}, 400);
	}
	render() {
		return (
			<div className={"chatApp__conv"}>
				<Title
					owner={this.props.owner}
				/>
				<MessageList
					owner={this.props.owner}
					messages={this.props.messages}
				/>
				<div className={"chatApp__convSendMessage clearfix"}>
					<TypingIndicator
						owner={this.props.owner}
						isTyping={this.props.isTyping}
					/>
					<InputMessage
						isLoading={this.state.isLoading}
						owner={this.props.owner}
						ownerAvatar={this.props.ownerAvatar}
						sendMessage={this.props.sendMessage}
						sendMessageLoading={this.sendMessageLoading}
						typing={this.props.typing}
            resetTyping={this.props.resetTyping}
					/>
				</div>
			</div>
		);
	}
}
/* end ChatBox component */
/* ========== */

/* ========== */
/* TypingIndicator component */
class TypingIndicator extends React.Component {
	constructor(props, context) {
		super(props, context);
	}
	render() {
		let typersDisplay = '';
		let countTypers = 0;
		/* for each user writing messages in chatroom */
		for ( var key in this.props.isTyping ) {
			/* retrieve the name if it isn't the owner of the chatbox */
			if( key != this.props.owner && this.props.isTyping[key] ) {
				typersDisplay += ', ' + key;
				countTypers++;
			}
		}
		/* formatting text */
		typersDisplay = typersDisplay.substr(1);
		typersDisplay += (( countTypers > 1 ) ? ' are ' : ' is ');
		/* if at least one other person writes */
		if ( countTypers > 0 ) {
			return (
				<div className={"chatApp__convTyping"}>{typersDisplay} writing
				<span className={"chatApp__convTypingDot"}></span>
				</div>
			);
		}
		return (
			<div className={"chatApp__convTyping"}></div>
		);
	}
}
/* end TypingIndicator component */
/* ========== */

/* ========== */
/* ChatRoom component - composed of multiple ChatBoxes */
class App extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			messages: [],
      //isTyping: [],
      endpoint:'/chat',
      roomId:"gaming"
		};
		this.sendMessage = this.sendMessage.bind(this);
		// this.typing = this.typing.bind(this);
    // this.resetTyping = this.resetTyping.bind(this);
    this.chatSocket = socketIOClient(this.state.endpoint)
  }
  
  componentDidMount() {
    this.chatSocket.emit('join', {roomId: this.state.roomId});
    this.chatSocket.on('message', (message) => {
      console.log(message);
      this.setState({
        messages: [...this.state.messages, message]
      })
    });
  }

	/* adds a new message to the chatroom */
	sendMessage(sender, senderAvatar, message, roomId) {
      let messageFormat = detectURL(message);
      if(sender == '') sender = "Anon";
      if(senderAvatar == '') senderAvatar = "https://i.imgur.com/JIHZl1g.png";
			let newMessageItem = {
				sender: sender,
				senderAvatar: senderAvatar,
        message: messageFormat,
        roomId: roomId
      };
      this.chatSocket.emit('message', newMessageItem);
      newMessageItem["id"] = this.state.messages.length-1;
      this.setState({
        messages: [...this.state.messages, newMessageItem]
      });
      // this.resetTyping(sender);
	}
	/* updates the writing indicator if not already displayed */
	typing(writer) {
		// if( !this.state.isTyping[writer] ) {
		// 	let stateTyping = this.state.isTyping;
		// 	stateTyping[writer] = true;
		// 	this.setState({ isTyping: stateTyping });
		// }
	}
	/* hide the writing indicator */
	resetTyping(writer) {
		// let stateTyping = this.state.isTyping;
		// stateTyping[writer] = false;
		// this.setState({ isTyping: stateTyping });
	}
	render() {
		let users = {};
		let chatBoxes = [];
		let messages = this.state.messages;
		let isTyping = this.state.isTyping;
		let sendMessage = this.sendMessage;
		let typing = this.typing;
		let resetTyping = this.resetTyping;

		/* Group details - can add as many groups as desired */
		users[0] = { name: 'Gaming', avatar: '' };
		/* test with two other users :)
		
		/* creation of a chatbox for each user present in the chatroom */
		Object.keys(users).map(function(key) {
			var user = users[key];
			chatBoxes.push(
				<ChatBox
					key={key}
					owner={user.name}
					ownerAvatar={user.avatar}
					sendMessage={sendMessage}
					typing={typing}
					resetTyping={resetTyping}
					messages={messages}
          isTyping={isTyping}
          roomId="gaming"
          endpoint='/chat'
				/>
			);
		});
		return (
			<div className={"chatApp__room"}>
				{chatBoxes}
			</div>
		);
	}
}
/* end ChatRoom component */
/* ========== */

/* detect url in a message and add a link tag */
function detectURL(message) {
	var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
	return message.replace(urlRegex, function(urlMatch) {
		return '<a href="' + urlMatch + '">' + urlMatch + '</a>';
	})
}

// class Username extends React.component {
//   //<input class="basic-slide" id="name" type="text" placeholder="Your best name" /><label for="name">Name</label>
// }

export default App;