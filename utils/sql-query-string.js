const QueryString = {
	gameCardSQL: {
		getAllRooms: `SELECT *
                      FROM gcard_rooms`,
		getAllRoomsAndConfig: `SELECT *
                               FROM gcard_rooms as rooms
                                        JOIN gcard_room_configs as configs
                                             ON rooms.room_id = configs.room_id`,
		getRoomConfig: `SELECT *
                        FROM gcard_room_configs
                        WHERE room_id = ?`,
		getRoomInfo: `SELECT *
                      FROM gcard_rooms
                      WHERE room_id = ?`,

		getRoomInfoAndConfig: `SELECT acc.username,
                                      rooms.*,
                                      configs.*
                               FROM gcard_rooms as rooms
                                        JOIN gcard_room_configs as configs
                                             ON rooms.room_id = configs.room_id
                                        LEFT JOIN accounts as acc
                                                  ON acc.user_id = rooms.created_by
                               WHERE rooms.room_id = ?`,
		getListPlayHistory: `SELECT *
                             FROM gcard_match_results
                             WHERE room_id = ?;
        SELECT *
        FROM two_play_results
        WHERE room_id = ?`,
		deleteMatchResults: `DELETE
                             FROM gcard_match_results
                             WHERE room_id = ?
                               and match_id = ?;
        DELETE
        FROM two_play_results
        WHERE room_id = ?
          and match_id = ?`,
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
	badmintonSQL: {
		getAllMatch: `SELECT bm.*,
                             bmc.*,
                             u1.username AS umpire_judge_name,
                             u2.username AS service_judge_name
                      FROM bmt_match_configs bmc
                               JOIN badminton_matches bm ON bmc.match_id = bm.match_id
                               LEFT JOIN accounts u1 ON bmc.umpire_judge = u1.email
                               LEFT JOIN accounts u2 ON bmc.service_judge = u2.email`,
		getMatchInfo: `SELECT bm.*,
                              bmc.*,
                              u1.username AS umpire_judge_name,
                              u2.username AS service_judge_name,
                              u3.username AS username
                       FROM bmt_match_configs bmc
                                JOIN badminton_matches bm ON bmc.match_id = bm.match_id
                                LEFT JOIN accounts u1 ON bmc.umpire_judge = u1.email
                                LEFT JOIN accounts u2 ON bmc.service_judge = u2.email
                                LEFT JOIN accounts u3 ON u3.user_id = bm.created_by
                       WHERE bm.match_id = ?`,
		createNewMatch: `INSERT INTO badminton_matches (match_title, created_by)
                         VALUES (?, ?)`,
		setMatchConfig: `INSERT INTO bmt_match_configs (match_id, score_format, max_time, player1_name, player2_name,
                                                        umpire_judge, service_judge)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
	},
	projectSQL: {
		getAllProjects: `SELECT pj.id,
                                pj.project_fullname,
                                pj.project_shortname,
                                pj.start_date,
                                pj.end_date,
                                pj.short_description,
                                pj.project_thumbnail,
                                pj.created_at,
                                pj.updated_at,
                                pj.group_id,
                                pg.group_title
                         FROM hieutndb.projects as pj
                                  left join project_groups as pg on pj.group_id = pg.group_id`,
		getProjectDetails: `SELECT *
                            FROM projects as proj
                                     JOIN project_articles as article ON proj.id = article.project_id
                            WHERE proj.id = ?`,

		createNewProject: `INSERT INTO projects (project_fullname, project_shortname, start_date, end_date,
                                                 short_description, project_thumbnail, group_id, github_link, demo_link)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		createProjectArticle: `INSERT INTO project_articles (project_id, article_body)
                               VALUES (?, ?)`,
		updateProjectDetails: `UPDATE projects
                               SET project_fullname  = ?,
                                   project_shortname = ?,
                                   start_date        = ?,
                                   end_date          = ?,
                                   short_description = ?,
                                   group_id          = ?,
                                   github_link       = ?,
                                   demo_link         = ?,
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
        where id = ?;`,
		getListProjectGroups: `SELECT *
                               FROM project_groups`,
		getProjectGroupInfo: `SELECT *
                              FROM project_groups
                              WHERE group_id = ?`,
		createNewProjectGroup: `INSERT INTO project_groups (group_title)
                                VALUES (?)`,
		updateProjectGroup: `UPDATE project_groups
                             SET group_title = ?
                             WHERE group_id = ?`,
		softDeleteGroup: `UPDATE project_groups
                          SET is_deleted = 1
                          WHERE group_id = ?`,
		recoverGroup: `UPDATE project_groups
                       SET is_deleted = 0
                       WHERE group_id = ?`,
		deleteProjectGroup: `DELETE
                             FROM project_groups
                             WHERE group_id = ?`,

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
	},
	accountSQL: {
		signUp: `INSERT INTO accounts (username, email, password)
                 VALUES (?, ?, ?)`,
		updateNewRefreshToken: `UPDATE accounts
                                SET refresh_token = ?
                                WHERE user_id = ?`,
		getAccountByEmail: `SELECT *
                            FROM accounts
                            WHERE email = ?`,
		getAccountByUsername: `SELECT *
                               FROM accounts
                               WHERE username = ?`,
		getAccountById: `SELECT *
                         FROM accounts
                         WHERE user_id = ?`,
		getListAccounts: `SELECT *
                          FROM accounts`,
		blockAccount: `UPDATE accounts
                       SET is_active = 0
                       WHERE user_id = ?`,
		unBlockAccount: `UPDATE accounts
                         SET is_active = 1
                         WHERE user_id = ?`,
	},
	appSQL: {
		getAllApps: `SELECT *
                     FROM apps`,
		getAppInformation: `SELECT *
                            FROM apps
                            WHERE app_id = ?`,
		addNewApp: `INSERT INTO apps (app_name, app_icon, app_link)
                    VALUES (?, ?, ?)`,

		updateAppInformation: `UPDATE apps
                               SET app_name = ?,
                                   app_link = ?
                               WHERE app_id = ?`,
		updateAppDisplayStatus: `UPDATE apps
                                 SET is_hide = ?
                                 WHERE app_id = ?`,
		deleteApp: `DELETE
                    FROM apps
                    WHERE app_id = ?`,

	},
}

module.exports = QueryString;