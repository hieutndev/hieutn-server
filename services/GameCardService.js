const BaseService = require("./BaseService");

const { gameCardSQL } = require("../utils/sql-query-string");
const Message = require("../utils/response-message")
const { emailMasking } = require("../utils/data-masking");

class GameCardService extends BaseService {
	constructor() {
		super();
	}

	async getAllRooms() {
		try {

			const listRooms = await super.query(gameCardSQL.getAllRoomsAndConfig, [])

			return {
				isCompleted: listRooms.isCompleted,
				message: listRooms.isCompleted ? Message.successGetAll(`${listRooms.results.length} Game Rooms`) : listRooms.message,
				results: listRooms.results.reverse()
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
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
		try {
			const newRoom = await this.query(gameCardSQL.createNewRoom, [created_by])

			if (!newRoom.isCompleted) {
				return {
					isCompleted: false,
					message: newRoom.message,
					results: [],
				}
			}

			const newRoomConfig = await this.query(gameCardSQL.createNewRoomConfig, [newRoom.results.insertId, first, second, third, fourth, red_two, black_two, burnt_out, swept_out, player1_name, player2_name, player3_name, player4_name])

			if (!newRoomConfig.isCompleted) {
				return {
					isCompleted: false,
					message: newRoomConfig.message,
					results: [],
				}
			}

			return {
				isCompleted: true,
				message: Message.successCreate("game card room"),
				results: {
					newRoomId: newRoom.results.insertId,
				}
			}


		} catch (error) {

			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getRoomInfo(roomId) {
		try {
			const roomDetails = await this.query(gameCardSQL.getRoomInfoAndConfig, [roomId])

			return {
				isCompleted: roomDetails.isCompleted,
				message: roomDetails.isCompleted ? Message.successGetOne(`Room ${roomId}`) : roomDetails.message,
				results: roomDetails.isCompleted ? {
					...roomDetails.results[0],
					username: roomDetails.results[0].username
				} : []
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getListPlayHistory(roomId) {
		try {
			const queryResults = await this.queryMany(gameCardSQL.getListPlayHistory, [roomId, roomId])

			if (!queryResults.isCompleted) {
				return {
					isCompleted: false,
					message: queryResults.message,
					results: [],
				}
			}

			const [matchResults, twoPlayResults] = queryResults.results;

			return {
				isCompleted: true,
				message: Message.successGetAll(`Room ${roomId} match results`),
				results: {
					matchResults,
					twoPlayResults
				}
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	getNewMatchId(matchHistory) {
		const listId = matchHistory.map((_v) => _v.match_id);

		return listId.length > 0 ? Math.max(...listId) + 1 : 1;
	}

	async insertNewResult(roomId, player1Result, player2Result, player3Result, player4Result, twoPlayResults) {
		try {

			const playHistory = await this.getListPlayHistory(roomId);

			if (!playHistory.isCompleted) {
				return {
					isCompleted: false,
					message: playHistory.message,
				}
			}

			const newMatchId = this.getNewMatchId(playHistory.results.matchResults);

			if (Array.isArray(twoPlayResults) && twoPlayResults.length > 0) {
				const mapQueryString = twoPlayResults.map((_r) => gameCardSQL.createTwoPlayResult).join(";")
				const mapInsertValue = (twoPlayResults.map((_r) => [roomId, newMatchId, _r.two_color, _r.taker, _r.burner, _r.quantity])).flat();
				const twoPlayResult = await this.queryMany(mapQueryString, mapInsertValue);

				if (twoPlayResult.isCompleted === false) {
					return {
						isCompleted: false,
						message: twoPlayResult.message,
						results: [],
					}
				}
			}

			const player1Values = [roomId, newMatchId, 1, player1Result.rank, player1Result.win_all, player1Result.burnt_out, player1Result.swept_out]
			const player2Values = [roomId, newMatchId, 2, player2Result.rank, player2Result.win_all, player2Result.burnt_out, player2Result.swept_out]
			const player3Values = [roomId, newMatchId, 3, player3Result.rank, player3Result.win_all, player3Result.burnt_out, player3Result.swept_out]
			const player4Values = [roomId, newMatchId, 4, player4Result.rank, player4Result.win_all, player4Result.burnt_out, player4Result.swept_out]

			const newResult = await this.query(gameCardSQL.createNewMatchResult, [...player1Values, ...player2Values, ...player3Values, ...player4Values])


			if (!newResult.isCompleted) {
				return {
					isCompleted: false,
					message: newResult.message,
					results: [],
				}
			}

			const roomMatchResults = await this.getListPlayHistory(roomId);


			if (roomMatchResults.isCompleted === false) {
				return {
					isCompleted: false,
					message: roomMatchResults.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successCreate("match results"),
				results: roomMatchResults.results
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async updateRoomConfig(roomId, { first, second, third, fourth, red_two, black_two, burnt_out, swept_out }) {
		try {
			const updatedConfig = await this.query(gameCardSQL.updateRoomConfig, [first, second, third, fourth, red_two, black_two, burnt_out, swept_out, roomId])

			if (!updatedConfig.isCompleted) {
				return {
					isCompleted: false,
					message: updatedConfig.message,
					results: [],
				}
			}

			const newRoomInfo = await GameCardService.getRoomInfo(roomId);

			if (!newRoomInfo.isCompleted) {
				return {
					isCompleted: false,
					message: newRoomInfo.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("room config"),
				results: newRoomInfo.results
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getRoomConfig(roomId) {
		try {

			const roomConfig = await this.query(gameCardSQL.getRoomConfig, [roomId])

			if (!roomConfig.isCompleted) {
				return {
					isCompleted: false,
					message: roomConfig.message,
					results: [],
				}
			}

			return {
				isCompleted: true,
				results: roomConfig.results[0]
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
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
					score += roomConfig.third;
				} else if (_d.rank === 4) {
					score += roomConfig.fourth;
				}

				if (_d.win_all) {
					score += roomConfig.swept_out * 3 - roomConfig.first;
				}

				if (_d.burnt_out) {
					score += -roomConfig.burnt_out - roomConfig.fourth;
				}

				if (_d.swept_out) {
					score += -roomConfig.swept_out;
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

			const isWinAllMatch = (matchResults) => {
				return {
					isWinAllMatch: matchResults.filter((_m) => _m.win_all === 1).length > 0,
					winner: matchResults.find((_m) => _m.win_all === 1)?.player_index ?? null
				};
			}

			const isBurntOutMatch = (matchResults) => {
				return {
					isBurntOutMatch: matchResults.filter((_m) => _m.burnt_out === 1).length > 0,
					winner: matchResults.find((_m) => _m.rank === 1)?.player_index ?? null,
					loser: matchResults.filter((_m) => _m.burnt_out === 1).map((_) => _.player_index) ?? null
				};
			}

			Array.from({ length: (matchResults.length / 4) }).forEach((_, index) => {
				const matchResult = getResultOfMatch(index + 1);
				if (isWinAllMatch(matchResult).isWinAllMatch) {
					const { winner } = isWinAllMatch(matchResults);
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

				} else if (isBurntOutMatch(matchResult).isBurntOutMatch) {
					const { winner, loser } = isBurntOutMatch(matchResults);

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
				} else {
					const first = getPlayerIndexByRank(1, matchResults);
					const second = getPlayerIndexByRank(2, matchResults);
					const third = getPlayerIndexByRank(3, matchResults);
					const fourth = getPlayerIndexByRank(4, matchResults);

					matrixScore.forEach((playerScore, index) => {
						if (index === first - 1) {
							matrixScore[index][fourth - 1] += roomConfig.first;
							matrixScore[fourth - 1][first - 1] += roomConfig.fourth;
						}

						if (index === second - 1) {
							matrixScore[index][third - 1] += roomConfig.second;
							matrixScore[third - 1][second - 1] += roomConfig.third;
						}
					})
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
			const [playHistory, roomConfig] = await Promise.all([this.getListPlayHistory(roomId), this.getRoomConfig(roomId)])

			if (!playHistory.isCompleted) {
				return {
					isCompleted: false,
					message: playHistory.message,
					results: [],
				}
			}
			if (!roomConfig.isCompleted) {
				return {
					isCompleted: false,
					message: roomConfig.message,
					results: [],
				}
			}


			return {
				isCompleted: true,
				message: Message.successGetAll(`Room ${roomId} results`),
				results: {
					scoreBoard: {
						totalScore: {
							player1: this.calculateTotalScore(1, roomConfig.results, playHistory.results),
							player2: this.calculateTotalScore(2, roomConfig.results, playHistory.results),
							player3: this.calculateTotalScore(3, roomConfig.results, playHistory.results),
							player4: this.calculateTotalScore(4, roomConfig.results, playHistory.results),
						},
						matrixScore: this.calculateMatrixScore(roomConfig.results, playHistory.results),
					},
					historyScoreBoard: Array.from({ length: (playHistory.results.matchResults.length / 4) })
						.map((_, index) => [
							this.calculateTotalScore(1, roomConfig.results, playHistory.results, index + 1),
							this.calculateTotalScore(2, roomConfig.results, playHistory.results, index + 1),
							this.calculateTotalScore(3, roomConfig.results, playHistory.results, index + 1),
							this.calculateTotalScore(4, roomConfig.results, playHistory.results, index + 1),
						]),
					playHistory: playHistory.results,
				}
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async closeRoom(roomId) {
		try {
			const closeRoomResult = await this.query(gameCardSQL.closeRoom, [roomId]);

			if (!closeRoomResult.isCompleted) {
				return {
					isCompleted: false,
					message: closeRoomResult.message,
					results: [],
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("Room Status"),
				results: closeRoomResult.results
			}
		} catch (error) {
			throw new Error(error)
		}
	}

	async deleteResults(roomId, matchId) {
		try {

			const deleteMatchResults = await super.queryMany(gameCardSQL.deleteMatchResults, [roomId, matchId, roomId, matchId]);

			return {
				isCompleted: deleteMatchResults.isCompleted,
				message: deleteMatchResults.isCompleted ? Message.successDelete("match results") : deleteMatchResults.message
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error.message
			}
		}
	}

}

module.exports = new GameCardService();