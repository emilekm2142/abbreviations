var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs = require('fs');
var chance = require('chance').Chance();
var io_server = require('socket.io')(http);
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
var Player = /** @class */ (function () {
    function Player(obj) {
        this.timesBeingCzar = 0;
        obj && Object.assign(this, obj);
    }
    Player.getPlayer = function (players, hash) {
        return players.filter(function (d) { return d.hash === hash; })[0];
    };
    Player.prototype.isPlayerInGame = function (rooms) {
        var _this = this;
        return rooms.filter(function (d) { return d.players.filter(function (p) { return p.hash === _this.hash; }).length > 0; }).length > 0;
    };
    return Player;
}());
var Room = /** @class */ (function () {
    function Room(obj) {
        this.history = [];
        this.hashesToPlayersIds = {};
        this.propositions = [];
        this.players = [];
        obj && Object.assign(this, obj);
        this.hash = randomHash();
    }
    Room.getRoomWithPlayer = function (rooms, hash) {
        return rooms.filter(function (d) { return d.players.filter(function (p) { return p.hash === hash; }).length > 0; })[0];
    };
    Room.getRoomByHash = function (rooms, hash) {
        return rooms.filter(function (d) { return d.hash === hash; })[0];
    };
    Room.prototype.getNewCzar = function () {
        var min = 0;
        var possible = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var x = _a[_i];
            x.isCzar = false;
            if (x.timesBeingCzar = min) {
                min = x.timesBeingCzar;
            }
        }
        for (var _b = 0, _c = this.players; _b < _c.length; _b++) {
            var x = _c[_b];
            if (x.timesBeingCzar <= min) {
                possible.push(x);
            }
        }
        chance.pickone(possible).isCzar = true;
    };
    Room.prototype.isPlayerAnAdmin = function (hash) {
        return this.players.filter(function (d) { return d.hash === hash; }).length > 0;
    };
    Room.prototype.toDTO = function (players, solutions) {
        if (players === void 0) { players = true; }
        if (solutions === void 0) { solutions = false; }
        // copy object
        var dto = JSON.parse(JSON.stringify(this));
        dto.playersNumber = this.players.length;
        delete dto.adminHash;
        if (!solutions) {
            delete dto.propositions;
        }
        delete dto.hashesToPlayersIds;
        delete dto.history;
        for (var _i = 0, _a = dto.players; _i < _a.length; _i++) {
            var player = _a[_i];
            delete player.hash;
        }
        return dto;
    };
    return Room;
}());
var distDir = __dirname + '/dist/';
app.use(express.static(distDir));
http.listen(process.env.PORT || 8080);
var players = [];
var rooms = [];
function randomHash() {
    return chance.string();
}
function handler(req, res) {
}
function updateRooms(rooms) {
    io_server.to('lobby').emit('updateRooms', rooms.filter(function (d) { return !d.hidden; }).map(function (d) { return d.toDTO(); }));
}
function updateRoom(room, solutions) {
    if (solutions === void 0) { solutions = false; }
    io_server.to(room.hash).emit('updateState', room.toDTO(true, solutions));
}
io_server.on('connection', function (socket) {
    console.log('connected');
    players.push(new Player({ hash: socket.id, id: randomHash() }));
    socket.join('lobby');
    // player utils
    socket.on('changeName', function (data, callback) {
        var player = Player.getPlayer(players, socket.id);
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
    socket.on('getMe', function (data, callback) {
        callback(Player.getPlayer(players, socket.id));
    });
    socket.on('ready', function (data) {
        Player.getPlayer(players, socket.id).ready = true;
        updateRoom(Room.getRoomWithPlayer(rooms, socket.id));
    });
    socket.on('disconnect', function (data) {
        console.log('dsiconnedt');
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        var player = Player.getPlayer(players, socket.id);
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
        for (var _i = 0, rooms_1 = rooms; _i < rooms_1.length; _i++) {
            var room_1 = rooms_1[_i];
            room_1.players = room_1.players.filter(function (d) { return d.hash !== socket.id; });
        }
        // remove player from list
        players = players.filter(function (d) { return d.hash !== socket.id; });
        rooms = rooms.filter(function (d) { return d.players.length > 0; });
        updateRooms(rooms);
    });
    // room
    socket.on('joinGame', function (data, callback) {
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomByHash(rooms, data.hash);
        if (!player.isPlayerInGame(rooms) && room.players.length < room.maxPlayers) {
            player.ready = false;
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
    });
    socket.on('leaveGame', function (data) {
        var player = Player.getPlayer(players, socket.id);
        if (player.isPlayerInGame(rooms)) {
            var room = Room.getRoomByHash(rooms, data.hash);
            player.ready = false;
            player.points = 0;
            room.players = room.players.filter(function (d) { return d.hash !== player.hash; });
            players = players.filter(function (d) { return d.hash !== socket.id; });
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
    socket.on('start', function (d) {
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.isPlayerAnAdmin(socket.id)) {
            room.state = State.czarTurn;
            for (var _i = 0, _a = room.players; _i < _a.length; _i++) {
                var x = _a[_i];
                x.isCzar = false;
                x.points = 0;
                x.sentSolution = false;
                x.isLastWinner = false;
            }
            room.getNewCzar();
            updateRoom(room);
        }
    });
    socket.on('setTask', function (d) {
        var task = d.task;
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.state === State.czarTurn && player.isCzar) {
            room.currentAbbreviation = task;
            room.state = State.typing;
            updateRoom(room);
        }
    });
    socket.on('getRandom', function (d, callback) {
        var x = '';
        for (var i = 0; i < d; i++) {
            x += chance.syllable();
        }
        callback(x.toUpperCase());
    });
    socket.on('sendSolution', function (d) {
        var solution = d.solution;
        var player = Player.getPlayer(players, socket.id);
        console.log(JSON.stringify(rooms));
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.state === State.typing) {
            // if the first sent solutoion
            if (room.propositions.filter(function (d) { return d.id !== player.id; }).length === 0) {
                var temporalHash = randomHash();
                room.hashesToPlayersIds[temporalHash] = player.id;
                room.propositions.push({ temporalHash: temporalHash, solution: solution });
                player.sentSolution = true;
                var sendSolutions = false;
                if (room.propositions.length === room.players.length - 1) {
                    room.state = State.choosing;
                    sendSolutions = true;
                }
                // TODO: zrobić tak, żeby ID były generowane na nowo i rozwiązania były wysyłane w jednym batchu jak będą gotowe wszystkie.
                updateRoom(room, sendSolutions);
            }
        }
    });
    socket.on('kick', function (data) {
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.isPlayerAnAdmin(socket.id)) {
            var foundPlayer = room.players.filter(function (d) { return d.id === data.id; })[0];
            if (foundPlayer.isCzar) {
                room.getNewCzar();
                room.state = State.czarTurn;
                delete room.propositions;
                room.currentAbbreviation = '';
            }
            foundPlayer.ready = false;
            foundPlayer.points = 0;
            room.players = room.players.filter(function (d) { return d.id !== data.id; });
            updateRoom(room);
            updateRooms(rooms);
        }
    });
    socket.on('preChoose', function (data) {
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.state === State.choosing && player.isCzar) {
            io_server.to(room.hash).emit('preChoose', data);
        }
    });
    socket.on('choose', function (data, callback) {
        var player = Player.getPlayer(players, socket.id);
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.state === State.choosing && player.isCzar) {
            var temporalHash = data.temporalHash;
            var winningPlayerId_1 = room.hashesToPlayersIds[temporalHash];
            var winningPlayer = room.players.filter(function (d) { return d.id === winningPlayerId_1; })[0];
            for (var _i = 0, _a = room.players; _i < _a.length; _i++) {
                var x = _a[_i];
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
    socket.on('makeRoom', function (data, callback) {
        console.log(data);
        if (data.name) {
            var room = new Room({
                adminHash: socket.id,
                name: data.name, date: Date(),
                hidden: !!data.hidden,
                maxPlayers: data.maxPlayers ? data.maxPlayers : 5,
                players: [], state: State.notStarted,
                currentAbbreviation: ''
            });
            Player.getPlayer(players, socket.id).isAdmin = true;
            rooms.push(room);
            io_server.to('lobby').emit('updateRooms', rooms.filter(function (d) { return !d.hidden; }).map(function (d) { return d.toDTO(); }));
            callback(room.hash);
        }
        else {
            callback(false);
        }
    });
    // crud
    socket.on('getRooms', function (data, callback) {
        callback(rooms.filter(function (d) { return !d.hidden; }).map(function (d) { return d.toDTO(); }));
    });
    // send rooms
    socket.on('getRoom', function (data, callback) {
        callback(Room.getRoomWithPlayer(rooms, socket.id).toDTO());
    });
    socket.on('deleteRoom', function (data) {
        var room = Room.getRoomWithPlayer(rooms, socket.id);
        if (room.isPlayerAnAdmin(socket.id)) {
            rooms = rooms.filter(function (d) { return d.hash !== room.hash; });
        }
    });
});
