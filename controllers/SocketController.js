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

	async createNewRoom({ created_by, roomConfig }) {

		const createNewRoom = await GameCardService.createNewRoom(created_by, roomConfig);
		if (createNewRoom.isCompleted) {
			const getListRooms = await GameCardService.getAllRooms();
			this.io.emit(SOCKET_EVENT_NAMES.CREATE_NEW_ROOM.SEND, {
				newRoomId: createNewRoom.results.newRoomId,
				listRooms: getListRooms.results
			});
		}

	}

	joinRoom(socket, { roomId, username }) {

		socket.join(roomId.toString());
		if (!this.currentInRooms.get(roomId)) {
			this.currentInRooms.set(roomId, [username]);
		} else {
			this.currentInRooms.set(roomId, Array.from(new Set([...this.currentInRooms.get(roomId), username])).filter((_v) => _v));
		}

		this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.PLAYER_CHANGE, {
			currentInRoom: this.currentInRooms.get(roomId).length,
			playersInRoom: this.currentInRooms.get(roomId),
		});
	}

	leaveRoom(socket, { roomId, username }) {
		socket.leave(roomId.toString());
		this.currentInRooms.set(roomId, this.currentInRooms.get(roomId) ? [...this.currentInRooms.get(roomId).filter((_v) => _v !== username)] : []);

		this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.PLAYER_CHANGE, {
			currentInRoom: this.currentInRooms.get(roomId).length,
			playersInRoom: this.currentInRooms.get(roomId),
		});
	}

	async createNewGCResult({
								roomId,
								player1Result,
								player2Result,
								player3Result,
								player4Result,
								twoPlayResults,
								createdBy
							}) {
		const insertNewResult = await GameCardService.insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults);

		if (insertNewResult.isCompleted) {
			const roomResults = await GameCardService.getRoomResults(roomId);

			if (roomResults.isCompleted) {
				this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.CREATE_RESULT.SEND, {
					createdBy,
					roomResults: roomResults.results
				});
			} else {
				this.io.to(roomId.toString()).emit("errorOnCreateNewResult", { error: insertNewResult.message });
			}
		} else {
			this.io.to(roomId.toString()).emit("errorOnCreateNewResult", { error: insertNewResult.message });
		}

	}

	async deleteMatchResult({ deleteBy, roomId, matchId }) {
		const deleteMatchResults = await GameCardService.deleteResults(roomId, matchId);

		if (deleteMatchResults.isCompleted) {
			const roomResults = await GameCardService.getRoomResults(roomId);

			if (roomResults.isCompleted) {
				this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.DELETE_MATCH_RESULTS.SEND, {
					deleteBy,
					roomResults: roomResults.results
				});
			} else {
				this.io.to(roomId.toString()).emit("errorOnDeleteMatchResults", { error: deleteMatchResults.message });
			}
		}
	}

	async updateRoomConfig({ roomId, updatedBy, newConfig }) {
		const updateRoomConfig = await GameCardService.updateRoomConfig(roomId, newConfig);

		if (updateRoomConfig.isCompleted) {
			const roomInfo = await GameCardService.getRoomInfo(roomId);

			if (roomInfo.isCompleted) {

				this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.UPDATE_ROOM_CONFIG.SEND, {
					updatedBy,
					roomDetails: roomInfo.results
				});
			} else {

				this.io.to(roomId.toString()).emit("errorOnUpdateRoomConfig", { error: updateRoomConfig.message });
			}
		} else {
			this.io.to(roomId.toString()).emit("errorOnUpdateRoomConfig", { error: updateRoomConfig.message });
		}
	}

	async closeRoom({ roomId, closedBy }) {
		const closeRoom = await GameCardService.closeRoom(roomId);

		if (closeRoom.isCompleted) {

			await Promise.all([GameCardService.getRoomInfo(roomId), GameCardService.getAllRooms()])
				.then(([roomInfo, getListRooms]) => {
					this.io.emit(SOCKET_EVENT_NAMES.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails: roomInfo.results,
						listRooms: getListRooms.results
					});
					this.io.to(roomId.toString()).emit(SOCKET_EVENT_NAMES.CLOSE_ROOM.SEND, {
						closedBy,
						roomDetails: roomInfo.results
					});
				})
		} else {
			this.io.to(roomId.toString()).emit("errorOnClosedRoom", { error: closeRoom.message });
		}
	}

	start() {


		this.io.on('connection', (socket) => {

			socket.on(SOCKET_EVENT_NAMES.CREATE_NEW_ROOM.RECEIVE, async (roomData) => await this.createNewRoom(roomData))

			socket.on(SOCKET_EVENT_NAMES.JOIN_CARDGAME_ROOM, (joinData) => this.joinRoom(socket, joinData))

			socket.on(SOCKET_EVENT_NAMES.LEAVE_CARDGAME_ROOM, (leaveData) => this.leaveRoom(socket, leaveData))

			socket.on(SOCKET_EVENT_NAMES.CREATE_RESULT.RECEIVE, async (resultData) => this.createNewGCResult(resultData))

			socket.on(SOCKET_EVENT_NAMES.UPDATE_ROOM_CONFIG.RECEIVE, async (updateData) => await this.updateRoomConfig(updateData))

			socket.on(SOCKET_EVENT_NAMES.DELETE_MATCH_RESULTS.RECEIVE, async (deleteData) => this.deleteMatchResult(deleteData))

			socket.on(SOCKET_EVENT_NAMES.CLOSE_ROOM.RECEIVE, async (closeData) => await this.closeRoom(closeData))

			socket.on("disconnect", () => {

			})
		})
	}
}

module.exports = SocketController;