const SOCKET_EVENT_NAMES = {
	GAME_CARD: {
		UPDATE_ROOM_CONFIG: {
			RECEIVE: "updateRoomConfig",
			SEND: "roomConfigUpdated",
			ERROR: "errorUpdateRoomConfig",
		},
		CLOSE_ROOM: {
			RECEIVE: "closeRoom",
			SEND: "roomClosed",
			ERROR: "errorCloseRoom",
		},
		REOPEN_ROOM: {
			RECEIVE: "reOpenRoom",
			SEND: "roomReOpened",
			ERROR: "errorReOpenRoom",
		},
		CREATE_RESULT: {
			RECEIVE: "createNewResult",
			SEND: "newResultCreated",
			ERROR: "errorCreateNewResult",
		},
		DELETE_MATCH_RESULT: {
			RECEIVE: "deleteMatchResult",
			SEND: "matchResultsDeleted",
			ERROR: "errorDeleteMatchResult",
		},
		CREATE_NEW_ROOM: {
			RECEIVE: "createNewRoom",
			SEND: "roomCreated",
		},
		JOIN_ROOM: "joinCGRoom",
		LEAVE_ROOM: "outCGRoom",
		PLAYER_CHANGE: "playerChange",

	}
};

module.exports = SOCKET_EVENT_NAMES;
