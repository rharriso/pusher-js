import PrivateChannel from './private_channel';
import Logger from '../logger';
import Members from './members';
import Pusher from '../pusher';
import UrlStore from 'core/utils/url_store';
import Message from '../connection/protocol/message';

export default class PresenceChannel extends PrivateChannel {
  members: Members;

  /** Adds presence channel functionality to private channels.
   *
   * @param {String} name
   * @param {Pusher} pusher
   */
  constructor(name : string, pusher : Pusher) {
    super(name, pusher);
    this.members = new Members();
  }

  /** Authenticates the connection as a member of the channel.
   *
   * @param  {String} socketId
   * @param  {Function} callback
   */
  authorize(socketId : string, callback : Function) {
    super.authorize(socketId, (error, authData) => {
      if (!error) {
        if (authData.channel_data === undefined) {
          let suffix = UrlStore.buildLogSuffix("authenticationEndpoint");
          Logger.warn(
            `Invalid auth response for channel '${this.name}',` +
            `expected 'channel_data' field. ${suffix}`
          );
          callback("Invalid auth response");
          return;
        }
        var channelData = JSON.parse(authData.channel_data);
        this.members.setMyID(channelData.user_id);
      }
      callback(error, authData);
    });
  }

  /** Handles presence and subscription messages. For internal use only.
   *
   * @param {Message} message
   */
  handleMessage(message: Message) {
    var event = message.event;
    if (event.indexOf("pusher_internal:") === 0) {
      this.handleInternalMessage(message)
    } else {
      var data = message.data;
      if (message.user_id) {
        var metadata = {};
        metadata['user_id'] = message.user_id;
        this.emit(event, data, metadata);
      } else {
        this.emit(event, data);
      }
    }
  }
  handleInternalMessage(message: Message) {
    var event = message.event;
    var data = message.data;
    switch (event) {
      case "pusher_internal:subscription_succeeded":
        this.subscriptionPending = false;
        this.subscribed = true;
        if (this.subscriptionCancelled) {
          this.pusher.unsubscribe(this.name);
        } else {
          this.members.onSubscription(data);
          this.emit("pusher:subscription_succeeded", this.members);
        }
        break;
      case "pusher_internal:member_added":
        var addedMember = this.members.addMember(data);
        this.emit('pusher:member_added', addedMember);
        break;
      case "pusher_internal:member_removed":
        var removedMember = this.members.removeMember(data);
        if (removedMember) {
          this.emit('pusher:member_removed', removedMember);
        }
        break
      default:
        super.handleMessage(message)
    }
  }


  /** Resets the channel state, including members map. For internal use only. */
  disconnect() {
    this.members.reset();
    super.disconnect();
  }
}
