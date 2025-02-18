const BaseService = require('./BaseService');
const { badmintonSQL } = require("../utils/sql-query-string");
const Message = require('../utils/response-message');

class BadmintonService extends BaseService {
	constructor() {
		super();
	}

	async createNewRoom({
							match_title,
							score_format,
							max_time,
							player1_name,
							player2_name,
							umpire_judge,
							service_judge
						}, created_by) {

		try {

			const createMatch = await super.query(badmintonSQL.createNewMatch, [match_title, created_by]);

			if (!createMatch.isCompleted) {
				return {
					isCompleted: false,
					message: createMatch.message,
				}
			}

			const newMatchId = createMatch.results.insertId
			const setMatchConfig = await super.query(badmintonSQL.setMatchConfig, [newMatchId, score_format, max_time, player1_name, player2_name, umpire_judge, service_judge])

			if (!setMatchConfig.isCompleted) {
				return {
					isCompleted: false,
					message: setMatchConfig.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successCreate("match"),
				results: {
					newMatchId
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getRoomDetails(roomId) {
		try {
			const getMatchInfo = await super.query(badmintonSQL.getMatchInfo, [roomId]);

			return {
				isCompleted: getMatchInfo.isCompleted,
				message: getMatchInfo.isCompleted ? Message.successGetOne("match") : getMatchInfo.message,
				results: getMatchInfo.results[0]
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

}

module.exports = new BadmintonService();