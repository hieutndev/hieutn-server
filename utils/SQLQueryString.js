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
	},
	projectSQL: {
		getAllProjects: `SELECT *
                         FROM projects`,
		getProjectDetails: `SELECT *
                            FROM projects as proj
                                     JOIN project_articles as article ON proj.id = article.project_id
                            WHERE proj.id = ?`,

		createNewProject: `INSERT INTO projects (project_fullname, project_shortname, start_date, end_date,
                                                 short_description, project_thumbnail)
                           VALUES (?, ?, ?, ?, ?, ?)`,
		createProjectArticle: `INSERT INTO project_articles (project_id, article_body)
                               VALUES (?, ?)`,
		updateProjectDetails: `UPDATE projects
                               SET project_fullname  = ?,
                                   project_shortname = ?,
                                   start_date        = ?,
                                   end_date          = ?,
                                   short_description = ?,
                                   updated_at        = CURRENT_TIMESTAMP
                               WHERE id = ?`,
		updateArticle: `UPDATE project_articles
                        SET article_body = ?
                        WHERE project_id = ?`,
		deleteProject: `DELETE
                        FROM project_articles
                        where project_id = ?;
        DELETE
        FROM projects
        where id = ?;`
	},
	educationSQL: {
		getAllEducations: `SELECT *
                           FROM education`,
		getEducationDetails: `SELECT *
                              FROM education
                              WHERE id = ?`,
		addNewEducation: `INSERT INTO education (title, organization, time_start, time_end)
                          VALUES (?, ?, ?, ?)`,
		updateEducationDetails: `UPDATE education
                                 SET title        = ?,
                                     organization = ?,
                                     time_start   = ?,
                                     time_end     = ?,
                                     updated_at   = CURRENT_TIMESTAMP
                                 WHERE id = ?`,
		softDeleteEducation: `UPDATE education
                              SET is_deleted = 1,
                                  updated_at = CURRENT_TIMESTAMP
                              WHERE id = ?`,
		recoverEducation: `UPDATE education
                           SET is_deleted = 0,
                               updated_at = CURRENT_TIMESTAMP
                           WHERE id = ?`,
		permanentDeleteEducation: `DELETE
                                   FROM education
                                   WHERE id = ?`
	},
	certificationSQL: {
		getAllCertifications: `SELECT *
                               FROM certification`,
		getCertificationDetails: `SELECT *
                                  FROM certification
                                  WHERE id = ?`,
		addNewCertification: `INSERT INTO certification (title, issued_by, issued_date, img_name)
                              VALUES (?, ?, ?, ?)`,
		updateCertification: `UPDATE certification
                              SET title       = ?,
                                  issued_by   = ?,
                                  issued_date = ?,
                                  updated_at  = CURRENT_TIMESTAMP
                              WHERE id = ?`,
		softDeleteCertification: `UPDATE certification
                                  SET is_deleted = 1,
                                      updated_at = CURRENT_TIMESTAMP
                                  WHERE id = ?`,
		recoverCertification: `UPDATE certification
                               SET is_deleted = 0,
                                   updated_at = CURRENT_TIMESTAMP
                               WHERE id = ?`,
		permanentDeleteCertification: `DELETE
                                       FROM certification
                                       WHERE id = ?`
	},
	employmentSQL: {
		getAllEmployments: `SELECT *
                            FROM employment`,
		getEmploymentDetails: `SELECT *
                               FROM employment
                               WHERE id = ?`,
		addNewEmployment: `INSERT INTO employment (title, organization, time_start, time_end)
                           VALUES (?, ?, ?, ?)`,
		updateEmployment: `UPDATE employment
                           SET title        = ?,
                               organization = ?,
                               time_start   = ?,
                               time_end     = ?,
                               updated_at   = CURRENT_TIMESTAMP
                           WHERE id = ?`,
		softDeleteEmployment: `UPDATE employment
                               SET is_deleted = 1,
                                   updated_at = CURRENT_TIMESTAMP
                               WHERE id = ?`,
		recoverEmployment: `UPDATE employment
                            SET is_deleted = 0,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?`,
		permanentDeleteEmployment: `DELETE
                                    FROM employment
                                    WHERE id = ?`
	}
}

module.exports = QueryString;