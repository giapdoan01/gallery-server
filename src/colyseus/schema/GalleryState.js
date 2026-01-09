const { Schema, MapSchema, ArraySchema, type } = require('@colyseus/schema');

class ChatMessage extends Schema {
    constructor() {
        super();
        this.id = "";
        this.sessionId = "";
        this.username = "";
        this.message = "";
        this.timestamp = 0;
    }
}

type("string")(ChatMessage.prototype, "id");
type("string")(ChatMessage.prototype, "sessionId");
type("string")(ChatMessage.prototype, "username");
type("string")(ChatMessage.prototype, "message");
type("number")(ChatMessage.prototype, "timestamp");

class Player extends Schema {
    constructor() {
        super();
        this.sessionId = "";
        this.username = "";
        this.avatarURL = ""; 
        this.y = 0;
        this.z = 0;
        this.rotationY = 0;
        this.animationState = "";
        this.isMoving = false;
    }
}

// Define schema types
type("string")(Player.prototype, "sessionId");
type("string")(Player.prototype, "username");
type("string")(Player.prototype, "avatarURL"); 
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "z");
type("number")(Player.prototype, "rotationY");
type("string")(Player.prototype, "animationState");
type("boolean")(Player.prototype, "isMoving");

class GalleryState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
        this.chatMessages = new ArraySchema();
        this.serverTime = 0;
    }
}

type({ map: Player })(GalleryState.prototype, "players");
type([ChatMessage])(GalleryState.prototype, "chatMessages");
type("number")(GalleryState.prototype, "serverTime");

module.exports = { GalleryState, Player, ChatMessage };
