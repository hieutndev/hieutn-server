const BaseService = require("./BaseService");

const { gameCardSQL } = require("../utils/sql-query-string");
const Message = require("../utils/response-message")
const { emailMasking } = require("../utils/data-masking");

const { RESPONSE_CODE } = require("../constants/response-code")

class GameCardService extends BaseService {
	constructor() {
		super();
	}

	async getAllRooms() {


		const listRooms = await super.query(gameCardSQL.getAllRoomsAndConfig)

		if (!listRooms.isCompleted) {
			throw new Error(listRooms.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
			results: listRooms.results.reverse()
		}

	}

	async createNewRoom(created_by, {
		first,
		second,
		third,
		fourth,
		red_two,
		black_two,
		burnt_out,
		swept_out,
		player1_name,
		player2_name,
		player3_name,
		player4_name
	}) {

		const createNewRoomStatus = await super.query(gameCardSQL.createNewRoom, [created_by])

		if (!createNewRoomStatus.isCompleted) {
			throw new Error(createNewRoomStatus.message)
		}

		const setRoomConfigStatus = await super.query(gameCardSQL.setNewRoomConfig, [createNewRoomStatus.results.insertId, first, second, third, fourth, red_two, black_two, burnt_out, swept_out, player1_name, player2_name, player3_name, player4_name])

		if (!setRoomConfigStatus.isCompleted) {
			await super.query(gameCardSQL.deleteRoom, [createNewRoomStatus.results.insertId])
			throw new Error(setRoomConfigStatus.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
			results: {
				newRoomId: createNewRoomStatus.results.insertId,
			}
		}
	}

	async getRoomInfoById(roomId) {
		const roomInfo = await this.query(gameCardSQL.getRoomInfoAndConfig, [roomId])

		if (!roomInfo.isCompleted) {
			throw new Error(roomInfo.message)
		}

		if (roomInfo.results.length === 0) {
			return false
		}
		return roomInfo.results[0]

	}

	async getRoomInfo(roomId) {
		try {

			const roomInfo = await this.getRoomInfoById(roomId);

			if (!roomInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: roomInfo
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getRoomPlayHistory(roomId) {
		const queryPlayHistoryStatus = await this.queryMany(gameCardSQL.getListPlayHistory, [roomId, roomId])

		if (!queryPlayHistoryStatus.isCompleted) {
			throw new Error(queryPlayHistoryStatus.message)
		}

		const [matchResults, twoPlayResults] = queryPlayHistoryStatus.results;

		return {
			matchResults,
			twoPlayResults
		}
	}

	getNewMatchId(matchHistory) {
		const listId = matchHistory.map((_v) => _v.match_id);

		return listId.length > 0 ? Math.max(...listId) + 1 : 1;
	}

	async insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults) {

		let playHistory = null;

		try {
			playHistory = await this.getRoomPlayHistory(roomId);
		} catch (error) {
			throw error;
		}

		const newMatchId = this.getNewMatchId(playHistory.matchResults);

		if (Array.isArray(twoPlayResults) && twoPlayResults.length > 0) {
			const mapQueryString = twoPlayResults.map((_r) => gameCardSQL.createTwoPlayResult).join(";")
			const mapInsertValue = (twoPlayResults.map((_r) => [roomId, newMatchId, _r.two_color, _r.taker, _r.burner, _r.quantity])).flat();
			const twoPlayResult = await this.queryMany(mapQueryString, mapInsertValue);

			if (twoPlayResult.isCompleted === false) {
				throw new Error(twoPlayResult.message)
			}
		}

		const player1Values = [roomId, newMatchId, 1, player1Result.rank, player1Result.win_all, player1Result.burnt_out, player1Result.swept_out]
		const player2Values = [roomId, newMatchId, 2, player2Result.rank, player2Result.win_all, player2Result.burnt_out, player2Result.swept_out]
		const player3Values = [roomId, newMatchId, 3, player3Result.rank, player3Result.win_all, player3Result.burnt_out, player3Result.swept_out]
		const player4Values = [roomId, newMatchId, 4, player4Result.rank, player4Result.win_all, player4Result.burnt_out, player4Result.swept_out]

		const insertNewResultStatus = await this.query(gameCardSQL.createNewMatchResult, [...player1Values, ...player2Values, ...player3Values, ...player4Values])

		if (!insertNewResultStatus.isCompleted) {
			throw new Error(insertNewResultStatus.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
		}
	}

	async updateRoomConfig(roomId, { first, second, third, fourth, red_two, black_two, burnt_out, swept_out }) {

		const roomIdExist = await this.getRoomInfoById(roomId);

		if (!roomIdExist) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
			}
		}

		const updatedConfig = await this.query(gameCardSQL.updateRoomConfig, [first, second, third, fourth, red_two, black_two, burnt_out, swept_out, roomId])

		if (!updatedConfig.isCompleted) {
			throw new Error(updatedConfig.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
		}
	}

	async getRoomConfig(roomId) {
		const roomConfig = await this.query(gameCardSQL.getRoomConfig, [roomId])

		if (!roomConfig.isCompleted) {
			throw new Error(roomConfig.message)
		}

		return roomConfig.results[0]
	}

	isHasTwoResults(twoPlayResults, playerIndex, matchIndex) {

		const playerResults = matchIndex
			? twoPlayResults.filter((_r) => _r.match_id === matchIndex && (_r.taker === playerIndex || _r.burner === playerIndex))
			: twoPlayResults.filter((_r) => _r.taker === playerIndex || _r.burner === playerIndex)

		playerResults

		return {
			isHasTwoResults: playerResults.length > 0,
			results: playerResults
		}
	}

	calculateTotalScore(playerIndex, roomConfig, matchHistory, matchIndex) {
		try {
			const { matchResults, twoPlayResults } = matchHistory;

			const playerResults = matchIndex
				? matchResults.filter(match => match.player_index === playerIndex && match.match_id === matchIndex)
				: matchResults.filter(match => match.player_index === playerIndex);

			const standardScore = playerResults.reduce((score, _d) => {
				if (_d.rank === 1) {
					const numsBurntOut = matchResults.filter((match) => {
						return match.match_id == _d.match_id && match.burnt_out === 1
					});

					if (numsBurntOut.length > 0) {
						const burntOutScore = numsBurntOut.length * roomConfig.burnt_out;
						score += burntOutScore;
					} else {
						score += roomConfig.first;
					}
				} else if (_d.rank === 2) {
					score += roomConfig.second;
				} else if (_d.rank === 3) {
					score -= roomConfig.third;
				} else if (_d.rank === 4) {
					score -= roomConfig.fourth
				}

				if (_d.win_all) {
					score += roomConfig.swept_out * 3 - roomConfig.first;
				}

				if (_d.burnt_out) {
					score -= roomConfig.burnt_out - roomConfig.fourth;
				}

				if (_d.swept_out) {
					score -= roomConfig.swept_out;
				}
				return score;
			}, 0);

			const { isHasTwoResults, results } = this.isHasTwoResults(twoPlayResults, playerIndex, matchIndex);

			if (isHasTwoResults) {
				const twoPlayScore = results.reduce((score, _d) => {
					if (_d.taker === playerIndex) {
						score += _d.quantity * (_d.two_color === "red" ? roomConfig.red_two : roomConfig.black_two);
					} else {
						score += -(_d.quantity * (_d.two_color === "red" ? roomConfig.red_two : roomConfig.black_two));
					}
					return score;
				}, 0);
				return standardScore + twoPlayScore;
			} else {
				return standardScore;
			}
		} catch (error) {
			throw new Error(error)
		}
	}

	calculateMatrixScore(roomConfig, matchHistory) {
		try {

			const { matchResults, twoPlayResults } = matchHistory;

			let matrixScore = [
				[null, 0, 0, 0],
				[0, null, 0, 0],
				[0, 0, null, 0],
				[0, 0, 0, null]
			]

			const getResultOfMatch = (matchId) => {
				return matchResults.filter((_m) => _m.match_id === matchId);
			}

			const getPlayerIndexByRank = (rank, matchResults) => {
				return matchResults.find((_m) => _m.rank === rank).player_index;

			}

			const isWinAllMatch = (currentMatchResults) => {
				return {
					isWinAllMatch: currentMatchResults.filter((_m) => _m.win_all === 1).length > 0,
					winner: currentMatchResults.find((_m) => _m.win_all === 1)?.player_index ?? null
				};
			}

			const isBurntOutMatch = (currentMatchResults) => {
				return {
					isBurntOutMatch: currentMatchResults.filter((_m) => _m.burnt_out === 1).length > 0,
					winner: currentMatchResults.find((_m) => _m.rank === 1)?.player_index ?? null,
					loser: currentMatchResults.filter((_m) => _m.burnt_out === 1).map((_) => _.player_index) ?? null
				};
			}

			Array.from({ length: (matchResults.length / 4) }).forEach((_, index) => {



				const currentMatchResults = getResultOfMatch(index + 1);


				if (isWinAllMatch(currentMatchResults).isWinAllMatch) {

					const { winner } = isWinAllMatch(currentMatchResults);

					matrixScore.forEach((playerScore, index) => {
						if (index === winner - 1) {
							playerScore.forEach((_, index) => {
								if (index !== winner - 1) {
									playerScore[index] += roomConfig.swept_out;
								}
							})
						} else {
							playerScore.forEach((_, index) => {
								if (index === winner - 1) {
									playerScore[index] += -roomConfig.swept_out;
								}
							})
						}
					})




				} else if (isBurntOutMatch(currentMatchResults).isBurntOutMatch) {
					const { winner, loser } = isBurntOutMatch(currentMatchResults);

					matrixScore.forEach((playerScore, index) => {
						if (index === winner - 1) {
							playerScore.forEach((_, scoreIndex) => {
								if (loser.includes(scoreIndex + 1)) {
									playerScore[scoreIndex] += roomConfig.burnt_out;
								}
							})
						} else {
							playerScore.forEach((_, scoreIndex) => {
								if (loser.includes(index + 1) && scoreIndex === winner - 1) {
									playerScore[scoreIndex] += -roomConfig.burnt_out;
								}
							})
						}
					})

					if (loser.length === 1) {
						const second = getPlayerIndexByRank(2, currentMatchResults);
						const third = getPlayerIndexByRank(3, currentMatchResults);

						matrixScore.forEach((_, index) => {
							if (index === second - 1) {
								matrixScore[index][third - 1] += roomConfig.second;
								matrixScore[third - 1][second - 1] -= roomConfig.third;
							}
						});

					}

				} else {
					const first = getPlayerIndexByRank(1, currentMatchResults);
					const second = getPlayerIndexByRank(2, currentMatchResults);
					const third = getPlayerIndexByRank(3, currentMatchResults);
					const fourth = getPlayerIndexByRank(4, currentMatchResults);

					matrixScore.forEach((_, index) => {
						if (index === first - 1) {
							matrixScore[index][fourth - 1] += roomConfig.first;
							matrixScore[fourth - 1][first - 1] -= roomConfig.fourth;
						}

						if (index === second - 1) {
							matrixScore[index][third - 1] += roomConfig.second;
							matrixScore[third - 1][second - 1] -= roomConfig.third;
						}
					});
				}
			})


			if (twoPlayResults.length > 0) {

				twoPlayResults.forEach((twoPlay) => {


					matrixScore[twoPlay.taker - 1][twoPlay.burner - 1] += twoPlay.quantity * (twoPlay.two_color === "red" ? roomConfig.red_two : roomConfig.black_two);
					matrixScore[twoPlay.burner - 1][twoPlay.taker - 1] += -twoPlay.quantity * (twoPlay.two_color === "red" ? roomConfig.red_two : roomConfig.black_two);


				})
			}


			return matrixScore
		} catch (error) {

			throw new Error(error)
		}
	}


	async getRoomResults(roomId) {
		try {
			const [playHistory, roomConfig] = await Promise.all([this.getRoomPlayHistory(roomId), this.getRoomConfig(roomId)])


			return {
				isCompleted: true,
				message: Message.successGetAll(`Room ${roomId} results`),
				results: {
					scoreBoard: {
						totalScore: {
							player1: this.calculateTotalScore(1, roomConfig, playHistory),
							player2: this.calculateTotalScore(2, roomConfig, playHistory),
							player3: this.calculateTotalScore(3, roomConfig, playHistory),
							player4: this.calculateTotalScore(4, roomConfig, playHistory),
						},
						matrixScore: this.calculateMatrixScore(roomConfig, playHistory),
					},
					historyScoreBoard: Array.from({ length: (playHistory.matchResults.length / 4) })
						.map((_, index) => [
							this.calculateTotalScore(1, roomConfig, playHistory, index + 1),
							this.calculateTotalScore(2, roomConfig, playHistory, index + 1),
							this.calculateTotalScore(3, roomConfig, playHistory, index + 1),
							this.calculateTotalScore(4, roomConfig, playHistory, index + 1),
						]),
					playHistory: playHistory,
				}
			}


		} catch (error) {
			throw error
		}
	}

	async closeRoom(roomId) {

		const closeRoomResult = await this.query(gameCardSQL.closeRoom, [roomId]);

		if (!closeRoomResult.isCompleted) {
			throw new Error(closeRoomResult.message)
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
		}

	}

	async deleteResults(roomId, matchId) {

		const deleteMatchResults = await super.queryMany(gameCardSQL.deleteMatchResults, [roomId, matchId, roomId, matchId]);

		if (!deleteMatchResults.isCompleted) {
			throw new Error(deleteMatchResults.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE,
		}
	}

}

module.exports = new GameCardService();