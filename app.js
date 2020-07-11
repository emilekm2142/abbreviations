"use strict";
var express = require('express');
var cors = require('cors');
var app = express();
let distDir = __dirname + '/dist/';
app.get('*', function (req, res) {
  res.sendfile(distDir + "index.html");
});
app.use(express.static(distDir));
var server = app.listen(process.env.PORT || 80);
let fs = require('fs');
let chance = require('chance').Chance();
let io_server = require("socket.io")(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }
});
var State;
(function (State) {
  State[State["notStarted"] = 0] = "notStarted";
  State[State["czarTurn"] = 1] = "czarTurn";
  State[State["typing"] = 2] = "typing";
  State[State["choosing"] = 3] = "choosing";
  State[State["paused"] = 4] = "paused";
})(State || (State = {}));
var ConnectionErrors;
(function (ConnectionErrors) {
  ConnectionErrors[ConnectionErrors["nameNotSet"] = 0] = "nameNotSet";
})(ConnectionErrors || (ConnectionErrors = {}));
class Player {
  constructor(obj) {
    this.timesBeingCzar = 0;
    obj && Object.assign(this, obj);
  }
  static getPlayer(players, hash) {
    return players.filter(d => d.hash === hash)[0];
  }
  isPlayerInGame(rooms) {
    return rooms.filter(d => d.players.filter(p => p.hash === this.hash).length > 0).length > 0;
  }
}
class Room {
  constructor(obj) {
    this.history = [];
    this.hashesToPlayersIds = {};
    this.propositions = [];
    this.players = [];
    obj && Object.assign(this, obj);
    this.hash = randomHash();
  }
  static getRoomWithPlayer(rooms, hash) {
    return rooms.filter(d => d.players.filter(p => p.hash === hash).length > 0)[0];
  }
  static getRoomByHash(rooms, hash) {
    return rooms.filter(d => d.hash === hash)[0];
  }
  getNewCzar() {
    let min = 0;
    const possible = [];
    for (const x of this.players) {
      x.isCzar = false;
      if (x.timesBeingCzar = min) {
        min = x.timesBeingCzar;
      }
    }
    for (const x of this.players) {
      if (x.timesBeingCzar <= min) {
        possible.push(x);
      }
    }
    chance.pickone(possible).isCzar = true;
  }
  isPlayerAnAdmin(hash) {
    return this.players.filter(d => d.hash === hash).length > 0;
  }
  toDTO(players = true, solutions = false) {
    // copy object
    const dto = JSON.parse(JSON.stringify(this));
    dto.playersNumber = this.players.length;
    delete dto.adminHash;
    if (!solutions) {
      delete dto.propositions;
    }
    delete dto.hashesToPlayersIds;
    delete dto.history;
    for (const player of dto.players) {
      delete player.hash;
    }
    return dto;
  }
}
let players = [];
let rooms = [];
function randomHash() {
  return chance.string();
}
function handler(req, res) {
}
function updateRooms(rooms) {
  io_server.to('lobby').emit('updateRooms', rooms.filter(d => !d.hidden).map(d => d.toDTO()));
}
function updateRoom(room, solutions = false) {
  io_server.to(room.hash).emit('updateState', room.toDTO(true, solutions));
}
io_server.on('connection', function (socket) {
  console.log('connected');
  players.push(new Player({ hash: socket.id, id: randomHash() }));
  socket.join('lobby');
  // player utils
  socket.on('changeName', (data, callback) => {
    const player = Player.getPlayer(players, socket.id);
    console.log(player);
    console.log(players);
    if (!player.isPlayerInGame(rooms)) {
      player.name = data.name;
      callback(true);
    }
    else {
      console.log('forbidden to change name');
      callback(false);
    }
  });
  socket.on('getMe', (data, callback) => {
    callback(Player.getPlayer(players, socket.id));
  });
  socket.on('ready', (data) => {
    Player.getPlayer(players, socket.id).ready = true;
    updateRoom(Room.getRoomWithPlayer(rooms, socket.id));
  });
  socket.on('disconnect', (data) => {
    console.log('dsiconnedt');
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    const player = Player.getPlayer(players, socket.id);
    if (player.isCzar && room) {
      room.getNewCzar();
      room.state = State.czarTurn;
      delete room.propositions;
      room.currentAbbreviation = '';
      player.isCzar = false;
    }
    if (room) {
      updateRoom(room);
    }
    // remove player from room
    for (const room of rooms) {
      room.players = room.players.filter(d => d.hash !== socket.id);
    }
    // remove player from list
    players = players.filter(d => d.hash !== socket.id);
    rooms = rooms.filter(d => d.players.length > 0);
    updateRooms(rooms);
  });
  // room
  socket.on('joinGame', (data, callback) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomByHash(rooms, data.hash);
    if (!room) {
      console.log("return to main");
      socket.emit("returnToMain");
    }
    else {
      if (!player.isPlayerInGame(rooms) && room.players.length < room.maxPlayers) {
        player.ready = room.state !== State.notStarted;
        player.points = 0;
        room.players.push(player);
        socket.leave('lobby');
        socket.join(room.hash);
        callback(room.toDTO());
        io_server.to(room.hash).emit('updateState', room.toDTO());
      }
      else {
        callback({ status: false, error: ConnectionErrors.nameNotSet });
      }
    }
  });
  socket.on('leaveGame', (data) => {
    const player = Player.getPlayer(players, socket.id);
    if (player.isPlayerInGame(rooms)) {
      const room = Room.getRoomByHash(rooms, data.hash);
      player.ready = false;
      player.points = 0;
      room.players = room.players.filter(d => d.hash !== player.hash);
      players = players.filter(d => d.hash !== socket.id);
      player.isAdmin = false;
      if (player.isCzar) {
        room.getNewCzar();
        room.state = State.czarTurn;
        delete room.propositions;
        room.currentAbbreviation = '';
        player.isCzar = false;
      }
      socket.leave(room.hash);
      updateRooms(rooms);
    }
  });
  socket.on('start', (d) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.isPlayerAnAdmin(socket.id)) {
      room.state = State.czarTurn;
      for (const x of room.players) {
        x.isCzar = false;
        x.points = 0;
        x.sentSolution = false;
        x.isLastWinner = false;
      }
      room.getNewCzar();
      updateRoom(room);
    }
  });
  socket.on('setTask', (d) => {
    const task = d.task;
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.state === State.czarTurn && player.isCzar) {
      room.currentAbbreviation = task;
      room.state = State.typing;
      updateRoom(room);
    }
  });
  socket.on('getRandom', (d, callback) => {
    let x = '';
    for (let i = 0; i < d; i++) {
      x += chance.syllable();
    }
    callback(x.toUpperCase());
  });
  socket.on('sendSolution', (d) => {
    const solution = d.solution;
    const player = Player.getPlayer(players, socket.id);
    console.log(JSON.stringify(rooms));
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.state === State.typing) {
      // if the first sent solutoion
      if (room.propositions.filter(d => d.id !== player.id).length === 0) {
        const temporalHash = randomHash();
        room.hashesToPlayersIds[temporalHash] = player.id;
        room.propositions.push({ temporalHash: temporalHash, solution: solution });
        player.sentSolution = true;
        let sendSolutions = false;
        if (room.propositions.length === room.players.length - 1) {
          room.state = State.choosing;
          sendSolutions = true;
        }
        // TODO: zrobić tak, żeby ID były generowane na nowo i rozwiązania były wysyłane w jednym batchu jak będą gotowe wszystkie.
        updateRoom(room, sendSolutions);
      }
    }
  });
  socket.on('chat', (data) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    io_server.to(room.hash).emit("chatMessage", { "player": player.name, "msg": data.msg });
  });
  socket.on('kick', (data) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    console.log("1. kick");
    if (room.isPlayerAnAdmin(socket.id)) {
      const foundPlayer = room.players.filter(d => d.id === data.id)[0];
      if (foundPlayer.isCzar) {
        room.getNewCzar();
        room.state = State.czarTurn;
        delete room.propositions;
        room.currentAbbreviation = '';
      }
      foundPlayer.ready = false;
      foundPlayer.points = 0;
      room.players = room.players.filter(d => d.id !== data.id);
      io_server.to(data.id).emit("returnToMain");
      updateRoom(room);
      updateRooms(rooms);
    }
  });
  socket.on('preChoose', (data) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.state === State.choosing && player.isCzar) {
      io_server.to(room.hash).emit('preChoose', data);
    }
  });
  socket.on('choose', (data, callback) => {
    const player = Player.getPlayer(players, socket.id);
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.state === State.choosing && player.isCzar) {
      const temporalHash = data.temporalHash;
      const winningPlayerId = room.hashesToPlayersIds[temporalHash];
      const winningPlayer = room.players.filter(d => d.id === winningPlayerId)[0];
      for (const x of room.players) {
        x.isLastWinner = false;
        x.sentSolution = false;
      }
      winningPlayer.points += 1;
      winningPlayer.isLastWinner = true;
      room.state = State.czarTurn;
      room.getNewCzar();
      room.history.push(room.propositions);
      delete room.propositions;
      room.currentAbbreviation = '';
      updateRoom(room);
    }
  });
  socket.on('makeRoom', (data, callback) => {
    console.log(data);
    if (data.name) {
      const room = new Room({
        adminHash: socket.id,
        name: data.name, date: Date(),
        hidden: !!data.hidden,
        maxPlayers: data.maxPlayers ? data.maxPlayers : 5,
        players: [], state: State.notStarted,
        currentAbbreviation: ''
      });
      Player.getPlayer(players, socket.id).isAdmin = true;
      rooms.push(room);
      io_server.to('lobby').emit('updateRooms', rooms.filter(d => !d.hidden).map(d => d.toDTO()));
      callback(room.hash);
    }
    else {
      callback(false);
    }
  });
  // crud
  socket.on('getRooms', (data, callback) => {
    callback(rooms.filter(d => !d.hidden).map(d => d.toDTO()));
  });
  // send rooms
  socket.on('getRoom', (data, callback) => {
    callback(Room.getRoomWithPlayer(rooms, socket.id).toDTO());
  });
  socket.on('deleteRoom', (data) => {
    const room = Room.getRoomWithPlayer(rooms, socket.id);
    if (room.isPlayerAnAdmin(socket.id)) {
      rooms = rooms.filter(d => d.hash !== room.hash);
    }
  });
});
