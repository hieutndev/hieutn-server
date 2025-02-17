const SOCKET_EVENT_NAMES = {
	UPDATE_ROOM_CONFIG: {
		RECEIVE: "updateRoomConfig",
		SEND: "roomConfigUpdated",
	},
	CLOSE_ROOM: {
		RECEIVE: "closeRoom",
		SEND: "roomClosed",
	},
	CREATE_RESULT: {
		RECEIVE: "createNewResult",
		SEND: "newResultCreated",
	},
	DELETE_MATCH_RESULTS: {
		RECEIVE: "deleteMatchResults",
		SEND: "matchResultsDeleted",
	},
	CREATE_NEW_ROOM: {
		RECEIVE: "createNewRoom",
		SEND: "roomCreated",
	},
	JOIN_CARDGAME_ROOM: "joinCGRoom",
	LEAVE_CARDGAME_ROOM: "outCGRoom",
	PLAYER_CHANGE: "playerChange",
};

module.exports = SOCKET_EVENT_NAMES;
