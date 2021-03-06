var gameConfig = require('./config').gameConfig;
var playerConfig = require('./config').playerConfig;

function PlayerManager() {
  this.maxPlayers = 4;
  this.players = {};
}

PlayerManager.prototype.addPlayer = function(id, cfg) {
  cfg = cfg || {};
  var x = cfg.x || 0;
  var y = cfg.y || gameConfig.boardHeight - playerConfig.playerHeight;

  var colors = ['yellow', 'cyan', 'purple', 'red', 'green', 'blue'];
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  var color = cfg.color || randomColor;
  this.players[id] = new Player(x, y, color);
}

PlayerManager.prototype.deletePlayer = function(id) {
  delete this.players[id];
}

PlayerManager.prototype.getPlayers = function() {
  return this.players;
}

PlayerManager.prototype.hasMaxPlayers = function() {
  return Object.keys(this.players).length == this.maxPlayers;
}

function Player(x, y, color) {
  this.weapon = null;
  this.color = color;
  this.life = 40;
  this.state = Player.state.REST_RIGHT;
  this.x = x;
  this.dx = 4;
  this.direction = null;
  this.dy = 4;
  this.y = y;
  this.immunity = {
    period: 2000,
    start: null
  };
}

// Various states
Player.state = {
  REST_LEFT: 1,
  REST_RIGHT: 2,
  MOVE_LEFT: 3,
  MOVE_RIGHT: 4,
  FIRE_SPEAR: 5,
  DEAD: 6
}

Player.prototype.equipWeapon = function(weapon) {
  this.weapon = weapon;
}

Player.prototype.getX = function() {
  return this.x + playerConfig.playerWidth / 2;
}

Player.prototype.getY = function() {
  return this.y + playerConfig.playerHeight / 2;
}

Player.prototype.setImmune = function(ms) {
  this.immunity.period = ms || 2000;
  this.immunity.start = (new Date()).getTime();
}

Player.prototype.isImmune = function() {
  if (this.immunity.start) {
    return (new Date()).getTime() - this.immunity.start < this.immunity.period;
  }
  return false;
}

Player.prototype.decreaseLife = function() {
  if(!this.isImmune()) {
    // Decrease life
    this.life -= 20;
    if (this.life < 0) {
      this.die();
      return;
    }
    // Set immunity to two secs
    this.setImmune(2000);
  }
}

Player.prototype.isAlive = function() {
  return this.life > 0;
}

Player.prototype.updatePosition = function(delta) {
  if (this.state == Player.state.MOVE_LEFT) {
    this.x = (this.x <= 0) ? this.x : this.x - this.dx;
  } else if (this.state == Player.state.MOVE_RIGHT) {
    this.x = ((this.x + playerConfig.playerWidth) >= gameConfig.boardWidth) ? this.x : this.x + this.dx;
  }
}

Player.prototype.setState = function(state) {
  if (this.state == Player.state.DEAD) {
    return;
  }

  this.state = state;
}

Player.prototype.moveLeft = function() {
  this.setState(Player.state.MOVE_LEFT);
}

Player.prototype.moveRight = function() {
  this.setState(Player.state.MOVE_RIGHT);
}

Player.prototype.fireSpear = function() {
  this.setState(Player.state.FIRE_SPEAR);
}

Player.prototype.stopMoving = function() {
  if (this.state == Player.state.MOVE_RIGHT) {
    this.setState(Player.state.REST_RIGHT);
  } else if (this.state == Player.state.MOVE_LEFT) {
    this.setState(Player.state.REST_LEFT);
  }
}

// When should a player be revived?
Player.prototype.die = function() {
  this.state = Player.state.DEAD;
}

exports.Player = Player;
exports.PlayerManager = PlayerManager;
