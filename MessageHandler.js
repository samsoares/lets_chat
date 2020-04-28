const BoundedQueue = require('./BoundedQueue');

/**
 * Class to handle incoming messages and provide an interface
 * to query for messages
 */
class MessageHandler {
  /**
   * Constructor for messages
   */
  constructor() {
    this.roomToMessagesMap = new Map();
    this.roomToMessageIdMap = new Map();
    this.messageStorageLimit = 30;

    this.getNewMessageIdForRoom = this.getNewMessageIdForRoom.bind(this);
    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.getMessagesForRoom = this.getMessagesForRoom.bind(this);
  }

  /**
   * Adds new message to storage
   * @param {string} sender
   * @param {string} senderAvatar URL for sender's profile picture
   * @param {string} message
   * @param {int} roomId
   * @return {int} the id of the message
   */
  onMessageReceived(sender, senderAvatar, message, roomId) {
    let messages = this.getMessagesForRoom(roomId);

    // create new list of messages for room
    if (messages === null) {
      messages = new BoundedQueue(this.messageStorageLimit);
      this.roomToMessagesMap.set(roomId, messages);
    }

    const id = this.getNewMessageIdForRoom(roomId);
    const newMessage = {sender, senderAvatar, message, roomId, id};

    // store message (in memory for now)
    // TODO: hook up to db
    messages.push(newMessage);

    console.log('New message received on roomId %s: %o', roomId, newMessage);
    return id;
  }

  /**
   * Gets the list of messages for a room
   * @param {string} roomId
   * @return {map} list of messages
   */
  getMessagesForRoom(roomId) {
    if (this.roomToMessagesMap.has(roomId)) {
      return this.roomToMessagesMap.get(roomId);
    }

    return null;
  }

  /**
   * Gets the id of the new message
   * @param {string} roomId
   * @return {int} id of new message
   */
  getNewMessageIdForRoom(roomId) {
    const newId = this.roomToMessageIdMap.has(roomId) ?
      this.roomToMessageIdMap.get(roomId) + 1 :
      0;

    this.roomToMessageIdMap.set(roomId, newId);
    return newId;
  }
}

module.exports = MessageHandler;
