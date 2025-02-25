const { Server } = require("socket.io");
const SOCKET_EVENT_NAMES = require("../configs/socket-event-names");
const GameCardService = require("../services/GameCardService");

class SocketController {

	constructor(server) {
		this.io = this.createIO(server)
		this.currentInRooms = new Map();
	}

	createIO(server) {
		return new Server(server, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"]
			}
		})
	}

	async gcCreateNewRoom({ created_by, roomConfig }) {

		try {
			const createNewRoom = await GameCardService.createNewRoom(created_by, roomConfig);
			if (createNewRoom.isCompleted) {
				const getListRooms = await GameCardService.getAllRooms();
				this.io.emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_NEW_ROOM.SEND, {
					newRoomId: createNewRoom.results.newRoomId,
					listRooms: getListRooms.results
				});
			}
		} catch (error) {
			console.log(error)
		}
	}

	gcJoinRoom(socket, { roomId, username }) {

		socket.join(roomId.toString());
		if (!this.currentInRooms.get(roomId)) {
			this.currentInRooms.set(roomId, [username]);
		} else {
			this.currentInRooms.set(roomId, Array.from(new Set([...this.currentInRooms.get(roomId), username])).filter((_v) => _v));
		}

		this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.PLAYER_CHANGE, {
			currentInRoom: this.currentInRooms.get(roomId).length,
			playersInRoom: this.currentInRooms.get(roomId),
		});
	}

	gcLeaveRoom(socket, { roomId, username }) {
		socket.leave(roomId.toString());
		this.currentInRooms.set(roomId, this.currentInRooms.get(roomId) ? [...this.currentInRooms.get(roomId).filter((_v) => _v !== username)] : []);

		this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.PLAYER_CHANGE, {
			currentInRoom: this.currentInRooms.get(roomId).length,
			playersInRoom: this.currentInRooms.get(roomId),
		});
	}

	async gcCreateNewResult({
		roomId,
		player1Result,
		player2Result,
		player3Result,
		player4Result,
		twoPlayResults,
		createdBy
	}) {
		try {
			await GameCardService.insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults);

			const roomResults = await GameCardService.getRoomResults(roomId);

			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_RESULT.SEND, {
				createdBy,
				roomResults: roomResults.results
			});
		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_RESULT.ERROR, { error: error.message || "x" });
		}
	}

	async gcDeleteMatchResult({ deleteBy, roomId, matchId }) {
		try {
			await GameCardService.deleteResults(roomId, matchId);

			const roomResults = await GameCardService.getRoomResults(roomId);

			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.DELETE_MATCH_RESULT.SEND, {
				deleteBy,
				roomResults: roomResults.results
			});
		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.DELETE_MATCH_RESULT.ERROR, { error: error.message });
		}
	}

	async gcUpdateRoomConfig({ roomId, updatedBy, newConfig }) {
		try {
			const updateRoomConfig = await GameCardService.updateRoomConfig(roomId, newConfig);

			if (!updateRoomConfig.isCompleted) {
				this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.UPDATE_ROOM_CONFIG.ERROR, { error: updateRoomConfig.message });
			}

			const roomDetails = await GameCardService.getRoomInfoById(roomId);

			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.UPDATE_ROOM_CONFIG.SEND, {
				updatedBy,
				roomDetails
			});

		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.UPDATE_ROOM_CONFIG.ERROR, { error: error.message });
		}

	}

	async gcCloseRoom({ roomId, closedBy }) {
		try {
			await GameCardService.closeRoom(roomId);

			await Promise.all([GameCardService.getRoomInfo(roomId), GameCardService.getAllRooms()])
				.then(([roomInfo, getListRooms]) => {
					this.io.emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails: roomInfo.results,
						listRooms: getListRooms.results
					});
					this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails: roomInfo.results
					});
				})

		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.ERROR, { error: error.message });
		}
	}

	start() {
		this.io.on('connection', (socket) => {

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_NEW_ROOM.RECEIVE, async (roomData) => await this.gcCreateNewRoom(roomData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.JOIN_ROOM, (joinData) => this.gcJoinRoom(socket, joinData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.LEAVE_ROOM, (leaveData) => this.gcLeaveRoom(socket, leaveData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_RESULT.RECEIVE, async (resultData) => this.gcCreateNewResult(resultData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.UPDATE_ROOM_CONFIG.RECEIVE, async (updateData) => await this.gcUpdateRoomConfig(updateData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.DELETE_MATCH_RESULT.RECEIVE, async (deleteData) => this.gcDeleteMatchResult(deleteData))

			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.RECEIVE, async (closeData) => await this.gcCloseRoom(closeData))

			socket.on("disconnect", () => {

			})
		})
	}
}

module.exports = SocketController;