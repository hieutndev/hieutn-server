const BaseService = require("./BaseService");

const { gameCardSQL } = require("../utils/SQLQueryString");

class GameCardService extends BaseService {
	constructor() {
		super();
	}

	async getAllRooms() {
		return await this.query(gameCardSQL.getAllRoomsWithConfig, []);
	}

	async createNewRoom({
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
			const newRoom = await this.query(gameCardSQL.createNewRoom, [9999])

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

	async getRoomDetails(roomId) {
		try {
			const roomDetails = await this.query(gameCardSQL.getRoomsDetailsWithConfig, [roomId])


			if (!roomDetails.isCompleted) {
				return {
					isCompleted: false,
					message: roomDetails.message,
					results: [],
				}
			}

			return {
				isCompleted: true,
				results: roomDetails.results[0]
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getRoomMatchResults(roomId) {
		try {
			const queryResults = await this.queryMany(gameCardSQL.getRoomMatchResults, [roomId, roomId])

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

	async insertNewResult(roomId, matchId, player1Result, player2Result, player3Result, player4Result, twoPlayResults) {
		try {
			if (Array.isArray(twoPlayResults) && twoPlayResults.length > 0) {
				const mapQueryString = twoPlayResults.map((_r) => gameCardSQL.createTwoPlayResult).join(";")
				const mapInsertValue = (twoPlayResults.map((_r) => [roomId, matchId, _r.two_color, _r.taker, _r.burner, _r.quantity])).flat();
				const twoPlayResult = await this.queryMany(mapQueryString, mapInsertValue);

				if (twoPlayResult.isCompleted === false) {
					return {
						isCompleted: false,
						message: twoPlayResult.message,
						results: [],
					}
				}
			}

			const player1Values = [roomId, matchId, 1, player1Result.rank, player1Result.win_all, player1Result.burnt_out, player1Result.swept_out]
			const player2Values = [roomId, matchId, 2, player2Result.rank, player2Result.win_all, player2Result.burnt_out, player2Result.swept_out]
			const player3Values = [roomId, matchId, 3, player3Result.rank, player3Result.win_all, player3Result.burnt_out, player3Result.swept_out]
			const player4Values = [roomId, matchId, 4, player4Result.rank, player4Result.win_all, player4Result.burnt_out, player4Result.swept_out]

			const newResult = await this.query(gameCardSQL.createNewMatchResult, [...player1Values, ...player2Values, ...player3Values, ...player4Values])


			if (!newResult.isCompleted) {
				return {
					isCompleted: false,
					message: newResult.message,
					results: [],
				}
			}

			return {
				isCompleted: true,
				results: newResult.results
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

			console.log(updatedConfig.results);

			return {
				isCompleted: true,
				results: updatedConfig.results
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
					score += -roomConfig.swept_out - roomConfig.fourth;
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
			console.log(error)
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

			console.log(matrixScore)
			return matrixScore
		} catch (error) {
			console.log(error)
			throw new Error(error)
		}
	}


	async getScoreBoard(roomId) {
		try {
			const [matchHistory, roomConfig] = await Promise.all([this.getRoomMatchResults(roomId), this.getRoomConfig(roomId)])

			if (!matchHistory.isCompleted) {
				return {
					isCompleted: false,
					message: matchHistory.message,
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
				results: {
					scoreBoard: {
						totalScore: {
							player1: this.calculateTotalScore(1, roomConfig.results, matchHistory.results),
							player2: this.calculateTotalScore(2, roomConfig.results, matchHistory.results),
							player3: this.calculateTotalScore(3, roomConfig.results, matchHistory.results),
							player4: this.calculateTotalScore(4, roomConfig.results, matchHistory.results),
						},
						matrixScore: this.calculateMatrixScore(roomConfig.results, matchHistory.results),
					},
					historyScoreBoard: Array.from({ length: (matchHistory.results.matchResults.length / 4) })
						.map((_, index) => [
							this.calculateTotalScore(1, roomConfig.results, matchHistory.results, index + 1),
							this.calculateTotalScore(2, roomConfig.results, matchHistory.results, index + 1),
							this.calculateTotalScore(3, roomConfig.results, matchHistory.results, index + 1),
							this.calculateTotalScore(4, roomConfig.results, matchHistory.results, index + 1),
						])
				}
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}


}

module.exports = new GameCardService();