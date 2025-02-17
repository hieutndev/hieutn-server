const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const debug = require('debug')('hieutn-server:server');
const http = require("http");
const GameCardService = require('./services/GameCardService');
const SOCKET_EVENT_NAMES = require("./configs/socket-event-names");

const indexRouter = require('./routes/index');


const app = express();


app.use(cors({
	origin: "*",
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))


// app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
	const { error, status, message } = err;


	return res.status(status || 500).json({
		status: status?.toString().startsWith("4") ? "failure" : "error" ?? "error",
		message: message
			? message
			: error
				? `${error.name} - ${error.message}`
				: "",
	});
});

const port = (process.env.NODE_ENV === "production" ? process.env.PRODUCTION_PORT : process.env.LOCAL_PORT) || 3000
app.set('port', port);

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
})

let currentInRooms = new Map();

io.on('connection', (socket) => {
	socket.on(SOCKET_EVENT_NAMES.CREATE_NEW_ROOM.RECEIVE, async ({ created_by, roomConfig }) => {
		const createNewRoom = await GameCardService.createNewRoom(created_by, roomConfig);

		if (createNewRoom.isCompleted) {
			const getListRooms = await GameCardService.getAllRooms();
			io.emit(SOCKET_EVENT_NAMES.CREATE_NEW_ROOM.SEND, {
				newRoomId: createNewRoom.results.newRoomId,
				listRooms: getListRooms.results
			});
		}
	})

	socket.on(SOCKET_EVENT_NAMES.JOIN_CARDGAME_ROOM, ({ roomId, username }) => {
		socket.join(roomId.toString());
		if (!currentInRooms.get(roomId)) {
			currentInRooms.set(roomId, [username]);
		} else {
			currentInRooms.set(roomId, Array.from(new Set([...currentInRooms.get(roomId), username])).filter((_v) => _v));
		}

		io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.PLAYER_CHANGE, {
			currentInRoom: currentInRooms.get(roomId).length,
			playersInRoom: currentInRooms.get(roomId),
		});
	})

	socket.on(SOCKET_EVENT_NAMES.LEAVE_CARDGAME_ROOM, ({ roomId, username }) => {
		socket.leave(roomId.toString());
		currentInRooms.set(roomId, currentInRooms.get(roomId) ? [...currentInRooms.get(roomId).filter((_v) => _v !== username)] : []);

		io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.PLAYER_CHANGE, {
			currentInRoom: currentInRooms.get(roomId).length,
			playersInRoom: currentInRooms.get(roomId),
		});
	})

	socket.on(SOCKET_EVENT_NAMES.CREATE_RESULT.RECEIVE, async ({
																   roomId,
																   player1Result,
																   player2Result,
																   player3Result,
																   player4Result,
																   twoPlayResults,
																   createdBy,
															   }) => {
		const insertNewResult = await GameCardService.insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults);

		if (insertNewResult.isCompleted) {
			const roomResults = await GameCardService.getRoomResults(roomId);

			if (roomResults.isCompleted) {
				io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.CREATE_RESULT.SEND, {
					createdBy,
					roomResults: roomResults.results
				});
			} else {
				io.to(roomId.toString()).emit("errorOnCreateNewResult", { error: insertNewResult.message });
			}
		} else {
			io.to(roomId.toString()).emit("errorOnCreateNewResult", { error: insertNewResult.message });
		}

	})
	socket.on(SOCKET_EVENT_NAMES.UPDATE_ROOM_CONFIG.RECEIVE, async ({ roomId, updatedBy, newConfig }) => {
		const updateRoomConfig = await GameCardService.updateRoomConfig(roomId, newConfig);

		if (updateRoomConfig.isCompleted) {
			const roomInfo = await GameCardService.getRoomInfo(roomId);

			if (roomInfo.isCompleted) {

				io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.UPDATE_ROOM_CONFIG.SEND, {
					updatedBy,
					roomDetails: roomInfo.results
				});
			} else {

				io.to(roomId.toString()).emit("errorOnUpdateRoomConfig", { error: updateRoomConfig.message });
			}
		} else {
			io.to(roomId.toString()).emit("errorOnUpdateRoomConfig", { error: updateRoomConfig.message });
		}
	})

	socket.on(SOCKET_EVENT_NAMES.DELETE_MATCH_RESULTS.RECEIVE, async ({ deleteBy, roomId, matchId }) => {
		const deleteMatchResults = await GameCardService.deleteResults(roomId, matchId);

		if (deleteMatchResults.isCompleted) {
			const roomResults = await GameCardService.getRoomResults(roomId);

			if (roomResults.isCompleted) {
				io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.DELETE_MATCH_RESULTS.SEND, {
					deleteBy,
					roomResults: roomResults.results
				});
			} else {
				io.to(roomId.toString()).emit("errorOnDeleteMatchResults", { error: deleteMatchResults.message });
			}
		}
	})

	socket.on("disconnect", () => {

	})
})

server.listen(port);
server.on('listening', onListening);

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
	console.log('Server is running on port ' + addr.port);
}
