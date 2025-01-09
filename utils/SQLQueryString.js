const QueryString = {
	gameCardSQL: {
		getAllRooms: `SELECT *
                      FROM gcard_rooms`,
		getAllRoomsWithConfig: `SELECT *
                                FROM gcard_rooms as rooms
                                         JOIN gcard_room_configs as configs
                                              ON rooms.room_id = configs.room_id`,
		getRoomConfig: `SELECT *
                        FROM gcard_room_configs
                        WHERE room_id = ?`,
		getRoomDetails: `SELECT *
                         FROM gcard_rooms
                         WHERE room_id = ?`,
		getRoomsDetailsWithConfig: `SELECT *
                                    FROM gcard_rooms as rooms
                                             JOIN gcard_room_configs as configs
                                                  ON rooms.room_id = configs.room_id
                                    WHERE rooms.room_id = ?`,
		getRoomMatchResults: `SELECT *
                              FROM gcard_match_results
                              WHERE room_id = ?;
        SELECT *
        FROM two_play_results
        WHERE room_id = ?`,

		createNewRoom: `INSERT INTO gcard_rooms (created_by)
                        VALUES (?)`,
		createNewRoomConfig: `INSERT INTO gcard_room_configs (room_id, first, second, third, fourth, red_two, black_two,
                                                              burnt_out, swept_out, player1_name, player2_name,
                                                              player3_name, player4_name)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		createTwoPlayResult: `INSERT INTO two_play_results(room_id, match_id, two_color, taker, burner, quantity)
                              VALUES (?, ?, ?, ?, ?, ?)`,
		createNewMatchResult: `INSERT INTO gcard_match_results
                               (room_id, match_id, player_index, \`rank\`, win_all, burnt_out, swept_out)
                               VALUES (?, ?, ?, ?, ?, ?, ?),
                                      (?, ?, ?, ?, ?, ?, ?),
                                      (?, ?, ?, ?, ?, ?, ?),
                                      (?, ?, ?, ?, ?, ?, ?)`,
		updateRoomConfig: `UPDATE gcard_room_configs
                           SET first     = ?,
                               second    = ?,
                               third     = ?,
                               fourth    = ?,
                               red_two   = ?,
                               black_two = ?,
                               burnt_out = ?,
                               swept_out = ?
                           WHERE room_id = ?`,
		closeRoom: `UPDATE gcard_rooms
                    SET is_closed = 1
                    WHERE room_id = ?`,
	}
}

module.exports = QueryString;