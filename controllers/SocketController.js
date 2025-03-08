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
			const newRoomId = await GameCardService.createNewRoom(created_by);

			if (newRoomId) {
				await GameCardService.setRoomConfig(newRoomId, roomConfig);
			}

			const listRooms = await GameCardService.getAllRooms();

			this.io.emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_NEW_ROOM.SEND, {
				newRoomId,
				listRooms
			});

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

			const roomPlayHistory = await GameCardService.getRoomPlayHistory(roomId);

			const newMatchId = GameCardService.getNewMatchId(roomPlayHistory.matchResults);

			await Promise.all([
				GameCardService.createPlayerResult(roomId, newMatchId, 1, player1Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 2, player2Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 3, player3Result),
				GameCardService.createPlayerResult(roomId, newMatchId, 4, player4Result),
				GameCardService.createTwoPlayResults(roomId, newMatchId, twoPlayResults)
			])

			const roomResults = await GameCardService.getRoomResults(roomId);

			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_RESULT.SEND, {
				createdBy,
				roomResults,
			});
		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CREATE_RESULT.ERROR, { error: error.message || "x" });
		}
	}

	async gcDeleteMatchResult({ deleteBy, roomId, matchId }) {
		try {

			await GameCardService.deleteMatchResults(roomId, matchId);

			const roomResults = await GameCardService.getRoomResults(roomId);

			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.DELETE_MATCH_RESULT.SEND, {
				deleteBy,
				roomResults
			});
		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.DELETE_MATCH_RESULT.ERROR, { error: error.message });
		}
	}

	async gcUpdateRoomConfig({ roomId, updatedBy, newConfig }) {
		try {
			await GameCardService.updateRoomConfig(roomId, newConfig);

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

			await Promise.all([GameCardService.getRoomInfoById(roomId), GameCardService.getAllRooms()])
				.then(([roomDetails, listRooms]) => {
					this.io.emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails,
						listRooms
					});
					this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails
					});
				})

		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.CLOSE_ROOM.ERROR, { error: error.message });
		}
	}

	async gcReOpenRoom({ roomId, reOpenBy }) {
		try {
			await GameCardService.reOpenRoom(roomId);

			await Promise.all([GameCardService.getRoomInfoById(roomId), GameCardService.getAllRooms()])
				.then(([roomDetails, listRooms]) => {
					this.io.emit(SOCKET_EVENT_NAMES.GAME_CARD.REOPEN_ROOM.SEND, {
						reOpenBy,
						roomDetails,
						listRooms
					});
					this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.REOPEN_ROOM.SEND, {
						reOpenBy,
						roomDetails
					});
				})

		} catch (error) {
			this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.GAME_CARD.REOPEN_ROOM.ERROR, { error: error.message });
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
			
			socket.on(SOCKET_EVENT_NAMES.GAME_CARD.REOPEN_ROOM.RECEIVE, async (reopenData) => await this.gcReOpenRoom(reopenData))

			socket.on("disconnect", () => {

			})
		})
	}
}

module.exports = SocketController;