const { Schema, MapSchema, type } = require('@colyseus/schema');


class Player extends Schema {
    constructor() {
        super();
        this.sessionId = "";
        this.username = "";
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotationY = 0;
        this.avatarIndex = 0;
        this.currentArtwork = "";
        this.isViewing = false;
    }
}

// Define schema types
type("string")(Player.prototype, "sessionId");
type("string")(Player.prototype, "username");
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "z");
type("number")(Player.prototype, "rotationY");
type("number")(Player.prototype, "avatarIndex");
type("string")(Player.prototype, "currentArtwork");
type("boolean")(Player.prototype, "isViewing");


class GalleryState extends Schema {
    constructor() {
        super();
        this.players = new MapSchema();
    }
}

type({ map: Player })(GalleryState.prototype, "players");

module.exports = { GalleryState, Player };
