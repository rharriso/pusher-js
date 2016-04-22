import Isomorphic from 'isomorphic/runtime';
import {Client as WebSocket} from "faye-websocket";
import {XMLHttpRequest} from "xmlhttprequest";
import Runtime from "../interface";

// Very verbose but until unavoidable until
// TypeScript 2.1, when spread attributes will be
// supported
const {
  TimelineTransport,
  getDefaultStrategy,
  Transports,
  whenReady,
  getProtocol,
  isXHRSupported,
  isXDRSupported,
  getGlobal,
  getAuthorizers,
  getLocalStorage,
  getClientFeatures,
  createXHR,
  getNetwork,
  createWebSocket
} = Isomorphic;

const NodeJS : Runtime = {
  TimelineTransport,
  getDefaultStrategy,
  Transports,
  whenReady,
  getProtocol,
  isXHRSupported,
  isXDRSupported,
  getGlobal,
  getAuthorizers,
  getLocalStorage,
  getClientFeatures,
  createXHR,
  getNetwork,
  createWebSocket,

  getWebSocketAPI() {
    return WebSocket;
  },

  getXHRAPI() {
    return XMLHttpRequest;
  }
};

export default NodeJS;
