const TABLE_NAMES = require("../constants/table-names");

const QueryString = {
  gameCardSQL: {
    getAllRooms: `SELECT *
                      FROM ${TABLE_NAMES.CARD_GAME_ROOMS}`,
    getAllRoomsAndConfig: `SELECT *
                               FROM ${TABLE_NAMES.CARD_GAME_ROOMS} as rooms
                                        JOIN ${TABLE_NAMES.CARD_GAME_ROOM_CONFIGS} as configs
                                             ON rooms.room_id = configs.room_id`,
    getRoomConfig: `SELECT *
                        FROM ${TABLE_NAMES.CARD_GAME_ROOM_CONFIGS}
                        WHERE room_id = ?`,
    getRoomInfo: `SELECT *
                      FROM ${TABLE_NAMES.CARD_GAME_ROOMS}
                      WHERE room_id = ?`,

    getRoomInfoAndConfig: `SELECT acc.username,
                                      rooms.*,
                                      configs.*
                               FROM ${TABLE_NAMES.CARD_GAME_ROOMS} as rooms
                                        JOIN ${TABLE_NAMES.CARD_GAME_ROOM_CONFIGS} as configs
                                             ON rooms.room_id = configs.room_id
                                        LEFT JOIN ${TABLE_NAMES.ACCOUNTS} as acc
                                                  ON acc.user_id = rooms.created_by
                               WHERE rooms.room_id = ?`,
    getListPlayHistory: `SELECT *
                             FROM ${TABLE_NAMES.CARD_GAME_MATCH_RESULTS}
                             WHERE room_id = ?;
        SELECT *
        FROM ${TABLE_NAMES.CARD_GAME_TWO_PLAY_RESULTS}
        WHERE room_id = ?`,
    deleteMatchResults: `DELETE
                             FROM ${TABLE_NAMES.CARD_GAME_MATCH_RESULTS}
                             WHERE room_id = ?
                               and match_id = ?;
        DELETE
        FROM ${TABLE_NAMES.CARD_GAME_TWO_PLAY_RESULTS}
        WHERE room_id = ?
          and match_id = ?`,
    createNewRoom: `INSERT INTO ${TABLE_NAMES.CARD_GAME_ROOMS} (created_by)
                        VALUES (?)`,
    deleteRoom: `DELETE
                     FROM ${TABLE_NAMES.CARD_GAME_ROOMS}
                     WHERE room_id = ?`,
    setNewRoomConfig: `INSERT INTO ${TABLE_NAMES.CARD_GAME_ROOM_CONFIGS} (room_id, first, second, third, fourth,
                                                                              red_two, black_two,
                                                                              burnt_out, swept_out, player1_name,
                                                                              player2_name,
                                                                              player3_name, player4_name)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    createTwoPlayResult: `INSERT INTO ${TABLE_NAMES.CARD_GAME_TWO_PLAY_RESULTS}(room_id, match_id, two_color, taker, burner, quantity)
                              VALUES (?, ?, ?, ?, ?, ?)`,
    createPlayerResult: `INSERT INTO ${TABLE_NAMES.CARD_GAME_MATCH_RESULTS}
                             (room_id, match_id, player_index, \`rank\`, win_all, burnt_out, swept_out)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`,
    updateRoomConfig: `UPDATE ${TABLE_NAMES.CARD_GAME_ROOM_CONFIGS}
                           SET first     = ?,
                               second    = ?,
                               third     = ?,
                               fourth    = ?,
                               red_two   = ?,
                               black_two = ?,
                               burnt_out = ?,
                               swept_out = ?
                           WHERE room_id = ?`,
    closeRoom: `UPDATE ${TABLE_NAMES.CARD_GAME_ROOMS}
                    SET is_closed = 1
                    WHERE room_id = ?`,
    reOpenRoom: `UPDATE ${TABLE_NAMES.CARD_GAME_ROOMS}
                     SET is_closed = 0
                     WHERE room_id = ?`,
  },
  badmintonSQL: {
    createNewTournament: `INSERT INTO ${TABLE_NAMES.BADMINTON_TOURNAMENTS} (tour_title, tour_description, venue,
                                                                                total_prize, tour_logo, created_by,
                                                                                start_date, end_date)
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    updateTourInfo: `UPDATE ${TABLE_NAMES.BADMINTON_TOURNAMENTS}
                         SET tour_title       = ?,
                             tour_description = ?,
                             venue            = ?,
                             total_prize      = ?,
                             start_date       = ?,
                             end_date         = ?
                         WHERE tour_id = ?`,
    updateTourLogo: `UPDATE ${TABLE_NAMES.BADMINTON_TOURNAMENTS}
                         SET tour_logo = ?
                         WHERE tour_id = ?`,
    getAllTournaments: `SELECT *
                            FROM ${TABLE_NAMES.BADMINTON_TOURNAMENTS}`,
    getTournamentInfo: `SELECT *
                            FROM ${TABLE_NAMES.BADMINTON_TOURNAMENTS}
                            WHERE tour_id = ?`,
    createNewPlayer: `INSERT INTO ${TABLE_NAMES.BADMINTON_PLAYERS} (player_display_name, player_first_name,
                                                                        player_last_name,
                                                                        player_birthdate, player_image, created_by)
                              VALUE(?, ?, ?, ?, ?, ?)`,
    getAllPlayers: `SELECT *
                        FROM ${TABLE_NAMES.BADMINTON_PLAYERS}`,
    getPlayerInfo: `SELECT *
                        FROM ${TABLE_NAMES.BADMINTON_PLAYERS}
                        WHERE player_id = ?`,
    updatePlayerInfo: `UPDATE ${TABLE_NAMES.BADMINTON_PLAYERS}
                           SET player_display_name = ?,
                               player_first_name   = ?,
                               player_last_name    = ?,
                               player_birthdate    = ?,
                               player_image        = ?
                           WHERE player_id = ?`,
    deletePlayer: `DELETE
                       FROM ${TABLE_NAMES.BADMINTON_PLAYERS}
                       WHERE player_id = ?`,
    addTeamToTournament: `INSERT INTO ${TABLE_NAMES.BADMINTON_TOURNAMENT_PLAYERS} (tour_id, team_id)
                              VALUES (?, ?)`,
    deleteTeamFromTournament: `DELETE
                                   FROM ${TABLE_NAMES.BADMINTON_TOURNAMENT_PLAYERS}
                                   WHERE tour_id = ?
                                     and team_id = ?`,
    getTournamentTeams: `select tplayers.*,
                                    teams.event_name,
                                    player1.player_display_name as player1_display_name,
                                    player1.player_first_name   as player1_first_name,
                                    player1.player_birthdate    as player1_birthdate,
                                    player2.player_display_name as player2_display_name,
                                    player2.player_first_name   as player2_first_name,
                                    player2.player_birthdate    as player2_birthdate
                             FROM bmt_tournament_players as tplayers
                                      JOIN bmt_teams AS teams
                                           ON tplayers.team_id = teams.team_id
                                      LEFT JOIN bmt_players AS player1
                                                ON teams.player1 = player1.player_id
                                      LEFT JOIN bmt_players AS player2
                                                ON teams.player2 = player2.player_id
                             WHERE tour_id = ?`,
    getAllTeams: `SELECT teams.*,
                             player1.player_display_name as player1_display_name,
                             player1.player_first_name   as player1_first_name,
                             player1.player_birthdate    as player1_birthdate,
                             player2.player_display_name as player2_display_name,
                             player2.player_first_name   as player2_first_name,
                             player2.player_birthdate    as player2_birthdate
                      FROM ${TABLE_NAMES.BADMINTON_TEAMS} as teams
                               JOIN ${TABLE_NAMES.BADMINTON_PLAYERS} as player1
                                    ON teams.player1 = player1.player_id
                               LEFT JOIN ${TABLE_NAMES.BADMINTON_PLAYERS} as player2
                                         ON teams.player2 = player2.player_id
		`,
    createNewTeam: `INSERT INTO ${TABLE_NAMES.BADMINTON_TEAMS} (player1, player2, event_name)
                        VALUES (?, ?, ?)`,
    searchTeam: `SELECT *
                     FROM ${TABLE_NAMES.BADMINTON_TEAMS}
                     WHERE player1 = ?
                       and player2 = ?
                       and event_name = ?`,
    searchSingleTeam: `SELECT *
                           FROM ${TABLE_NAMES.BADMINTON_TEAMS}
                           WHERE player1 = ?
                             and player2 IS NULL
                             and event_name = ?`,
    getTeamInfo: `SELECT teams.*,
                             player1.player_display_name as player1_display_name,
                             player1.player_first_name   as player1_first_name,
                             player2.player_display_name as player2_display_name,
                             player2.player_first_name   as player2_first_name
                      FROM ${TABLE_NAMES.BADMINTON_TEAMS} as teams
                               JOIN ${TABLE_NAMES.BADMINTON_PLAYERS} as player1
                                    ON teams.player1 = player1.player_id
                               LEFT JOIN ${TABLE_NAMES.BADMINTON_PLAYERS} as player2
                                         ON teams.player2 = player2.player_id
                      WHERE team_id = ?`,
    createNewMatch: `INSERT INTO ${TABLE_NAMES.BADMINTON_TOURNAMENT_MATCHES} (tour_id, event_name, team1, team2, round_name)
                         VALUES (?, ?, ?, ?, ?)`,
    searchTeamInTour: `SELECT *
                           FROM ${TABLE_NAMES.BADMINTON_TOURNAMENT_PLAYERS}
                           WHERE tour_id = ?
                             and team_id = ?`,
    getAllTourDraws: `SELECT *
                          FROM ${TABLE_NAMES.BADMINTON_TOUR_DRAWS}
                          WHERE tour_id = ?`,
    createNewDraw: `INSERT INTO ${TABLE_NAMES.BADMINTON_TOUR_DRAWS} (tour_id, draw_name, event_name)
                        VALUES (?, ?, ?)`,
    getDrawInfo: `SELECT *
                      FROM ${TABLE_NAMES.BADMINTON_TOUR_DRAWS}
                      WHERE draw_id = ?`,
    getTeamsInDraw: `SELECT drawteams.team_id,
                                bteams.player1,
                                bteams.player2,
                                bteams.event_name,
                                player1.player_display_name AS player1_display_name,
                                player2.player_display_name AS player2_display_name
                         FROM bmt_tour_draw_teams AS drawteams
                                  JOIN bmt_teams AS bteams
                                       on bteams.team_id = drawteams.team_id
                                  JOIN bmt_players AS player1
                                       on bteams.player1 = player1.player_id
                                  left JOIN bmt_players AS player2
                                            on bteams.player2 = player2.player_id
                         WHERE drawteams.draw_id = ?`,
    searchTeamInDraw: `SELECT *
                           FROM ${TABLE_NAMES.BADMINTON_TOUR_DRAW_TEAMS}
                           WHERE draw_id = ?
                             and team_id = ?`,
    addTeamToDraw: `INSERT INTO ${TABLE_NAMES.BADMINTON_TOUR_DRAW_TEAMS} (draw_id, team_id)
                        VALUES (?, ?)`,
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
                         FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} AS pj
                                  left JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} as pg on pj.group_id = pg.group_id`,
    getAllProjectsWithSearch: `SELECT pj.id,
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
                                   FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} AS pj
                                            left JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} as pg on pj.group_id = pg.group_id
                                   WHERE (pj.project_fullname LIKE ? OR pj.project_shortname LIKE ? OR pj.short_description LIKE ? OR pg.group_title LIKE ?)
                                   ORDER BY pj.created_at DESC
                                   LIMIT ? OFFSET ?`,
    getAllProjectsWithoutSearch: `SELECT pj.id,
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
                                      FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} AS pj
                                               left JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} as pg on pj.group_id = pg.group_id
                                      ORDER BY pj.created_at DESC
                                      LIMIT ? OFFSET ?`,
    countProjectsWithSearch: `SELECT COUNT(*) as total
                                      FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} AS pj
                                               LEFT JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} as pg on pj.group_id = pg.group_id
                                      WHERE (pj.project_fullname LIKE ? OR pj.project_shortname LIKE ? OR pj.short_description LIKE ? OR pg.group_title LIKE ?)`,
    countProjectsWithoutSearch: `SELECT COUNT(*) as total
                                         FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} AS pj
                                                  LEFT JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} as pg on pj.group_id = pg.group_id`,
    getProjectDetails: `SELECT *
                            FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS} as proj
                                     JOIN ${TABLE_NAMES.PORTFOLIO_PROJECT_ARTICLES} as article ON proj.id = article.project_id
                            WHERE proj.id = ?`,
    getListProjectImages: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_IMAGES}
                               WHERE project_id = ?`,
    createNewProject: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_PROJECTS} (project_fullname, project_shortname,
                                                                          start_date, end_date,
                                                                          short_description, project_thumbnail,
                                                                          group_id, github_link, demo_link)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    createProjectArticle: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_PROJECT_ARTICLES} (project_id, article_body)
                               VALUES (?, ?)`,
    insertProjectImages: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_PROJECT_IMAGES} (project_id, image_name)
                              VALUES (?, ?)`,
    deleteProjectImage: `DELETE
                             FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_IMAGES}
                             WHERE project_id = ?
                               AND image_name = ? `,
    updateProjectDetails: `UPDATE ${TABLE_NAMES.PORTFOLIO_PROJECTS}
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
    updateArticle: `UPDATE ${TABLE_NAMES.PORTFOLIO_PROJECT_ARTICLES}
                        SET article_body = ?
                        WHERE project_id = ?`,
    deleteProject: `DELETE
                        FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_ARTICLES}
                        where project_id = ?;
        DELETE
        FROM ${TABLE_NAMES.PORTFOLIO_PROJECTS}
        where id = ?;`,
    getListProjectGroups: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}`,
    getProjectGroupInfo: `SELECT *
                              FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}
                              WHERE group_id = ?`,
    createNewProjectGroup: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS} (group_title)
                                VALUES (?)`,
    updateProjectGroup: `UPDATE ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}
                             SET group_title = ?
                             WHERE group_id = ?`,
    softDeleteGroup: `UPDATE ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}
                          SET is_deleted = 1
                          WHERE group_id = ?`,
    recoverGroup: `UPDATE ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}
                       SET is_deleted = 0
                       WHERE group_id = ?`,
    deleteProjectGroup: `DELETE
                             FROM ${TABLE_NAMES.PORTFOLIO_PROJECT_GROUPS}
                             WHERE group_id = ?`,
  },
  educationSQL: {
    getAllEducations: `SELECT *
                           FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}`,
    getAllEducationsWithSearch: `SELECT *
                                     FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                                     WHERE (title LIKE ? OR organization LIKE ?)
                                     ORDER BY time_start DESC, created_at DESC
                                     LIMIT ? OFFSET ?`,
    getAllEducationsWithoutSearch: `SELECT *
                                        FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                                        ORDER BY time_start DESC, created_at DESC
                                        LIMIT ? OFFSET ?`,
    countEducationsWithSearch: `SELECT COUNT(*) as total
                                    FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                                    WHERE (title LIKE ? OR organization LIKE ?)`,
    countEducationsWithoutSearch: `SELECT COUNT(*) as total
                                       FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}`,
    getEducationDetails: `SELECT *
                              FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                              WHERE id = ?`,
    addNewEducation: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_EDUCATION} (title, organization, time_start, time_end)
                          VALUES (?, ?, ?, ?)`,
    updateEducationDetails: `UPDATE ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                                 SET title        = ?,
                                     organization = ?,
                                     time_start   = ?,
                                     time_end     = ?,
                                     updated_at   = CURRENT_TIMESTAMP
                                 WHERE id = ?`,
    softDeleteEducation: `UPDATE ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                              SET is_deleted = 1,
                                  updated_at = CURRENT_TIMESTAMP
                              WHERE id = ?`,
    recoverEducation: `UPDATE ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                           SET is_deleted = 0,
                               updated_at = CURRENT_TIMESTAMP
                           WHERE id = ?`,
    permanentDeleteEducation: `DELETE
                                   FROM ${TABLE_NAMES.PORTFOLIO_EDUCATION}
                                   WHERE id = ?`,
  },
  certificationSQL: {
    getAllCertifications: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}`,
    getAllCertificationsWithSearch: `SELECT *
                                         FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                         WHERE (title LIKE ? OR issued_by LIKE ?)
                                         ORDER BY issued_date DESC, created_at DESC
                                         LIMIT ? OFFSET ?`,
    getAllCertificationsWithoutSearch: `SELECT *
                                            FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                            ORDER BY issued_date DESC, created_at DESC
                                            LIMIT ? OFFSET ?`,
    countCertificationsWithSearch: `SELECT COUNT(*) as total
                                        FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                        WHERE (title LIKE ? OR issued_by LIKE ?)`,
    countCertificationsWithoutSearch: `SELECT COUNT(*) as total
                                           FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}`,
    getCertificationDetails: `SELECT *
                                  FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                  WHERE id = ?`,
    addNewCertification: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_CERTIFICATION} (title, issued_by, issued_date, img_name)
                              VALUES (?, ?, ?, ?)`,
    updateCertification: `UPDATE ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                              SET title       = ?,
                                  issued_by   = ?,
                                  issued_date = ?,
                                  updated_at  = CURRENT_TIMESTAMP
                              WHERE id = ?`,
    softDeleteCertification: `UPDATE ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                  SET is_deleted = 1,
                                      updated_at = CURRENT_TIMESTAMP
                                  WHERE id = ?`,
    recoverCertification: `UPDATE ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                               SET is_deleted = 0,
                                   updated_at = CURRENT_TIMESTAMP
                               WHERE id = ?`,
    permanentDeleteCertification: `DELETE
                                       FROM ${TABLE_NAMES.PORTFOLIO_CERTIFICATION}
                                       WHERE id = ?`,
  },
  employmentSQL: {
    getAllEmployments: `SELECT *
                            FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}`,
    getAllEmploymentsWithSearch: `SELECT *
                                      FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                                      WHERE (title LIKE ? OR organization LIKE ?)
                                      ORDER BY time_start DESC, created_at DESC
                                      LIMIT ? OFFSET ?`,
    getAllEmploymentsWithoutSearch: `SELECT *
                                         FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                                         ORDER BY time_start DESC, created_at DESC
                                         LIMIT ? OFFSET ?`,
    countEmploymentsWithSearch: `SELECT COUNT(*) as total
                                     FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                                     WHERE (title LIKE ? OR organization LIKE ?)`,
    countEmploymentsWithoutSearch: `SELECT COUNT(*) as total
                                        FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}`,
    getEmploymentDetails: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                               WHERE id = ?`,
    addNewEmployment: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT} (title, organization, time_start, time_end)
                           VALUES (?, ?, ?, ?)`,
    updateEmployment: `UPDATE ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                           SET title        = ?,
                               organization = ?,
                               time_start   = ?,
                               time_end     = ?,
                               updated_at   = CURRENT_TIMESTAMP
                           WHERE id = ?`,
    softDeleteEmployment: `UPDATE ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                               SET is_deleted = 1,
                                   updated_at = CURRENT_TIMESTAMP
                               WHERE id = ?`,
    recoverEmployment: `UPDATE ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                            SET is_deleted = 0,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ?`,
    permanentDeleteEmployment: `DELETE
                                    FROM ${TABLE_NAMES.PORTFOLIO_EMPLOYMENT}
                                    WHERE id = ?`,
  },
  accountSQL: {
    signUp: `INSERT INTO ${TABLE_NAMES.ACCOUNTS} (username, email, password)
                 VALUES (?, ?, ?)`,
    updateNewRefreshToken: `UPDATE ${TABLE_NAMES.ACCOUNTS}
                                SET refresh_token = ?
                                WHERE user_id = ?`,
    getAccountByEmail: `SELECT *
                            FROM ${TABLE_NAMES.ACCOUNTS}
                            WHERE email = ?`,
    getAccountByUsername: `SELECT *
                               FROM ${TABLE_NAMES.ACCOUNTS}
                               WHERE username = ?`,
    getAccountById: `SELECT *
                         FROM ${TABLE_NAMES.ACCOUNTS}
                         WHERE user_id = ?`,
    getListAccounts: `SELECT *
                          FROM ${TABLE_NAMES.ACCOUNTS}`,
    getListAccountsWithSearch: `SELECT *
                                    FROM ${TABLE_NAMES.ACCOUNTS}
                                    WHERE (username LIKE ? OR email LIKE ?)
                                    ORDER BY created_at DESC
                                    LIMIT ? OFFSET ?`,
    getListAccountsWithoutSearch: `SELECT *
                                       FROM ${TABLE_NAMES.ACCOUNTS}
                                       ORDER BY created_at DESC
                                       LIMIT ? OFFSET ?`,
    countAccountsWithSearch: `SELECT COUNT(*) as total
                                  FROM ${TABLE_NAMES.ACCOUNTS}
                                  WHERE (username LIKE ? OR email LIKE ?)`,
    countAccountsWithoutSearch: `SELECT COUNT(*) as total
                                     FROM ${TABLE_NAMES.ACCOUNTS}`,
    blockAccount: `UPDATE ${TABLE_NAMES.ACCOUNTS}
                       SET is_active = 0
                       WHERE user_id = ?`,
    unBlockAccount: `UPDATE ${TABLE_NAMES.ACCOUNTS}
                         SET is_active = 1
                         WHERE user_id = ?`,
    updateAccountPassword: `UPDATE ${TABLE_NAMES.ACCOUNTS}
                            SET password = ?
                            WHERE user_id = ?`,
  },
  appSQL: {
    getAllApps: `SELECT *
                     FROM ${TABLE_NAMES.PORTFOLIO_APPS}`,
    getAllAppsWithSearchAndFilter: `SELECT *
                                        FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                                        WHERE (app_name LIKE ?) AND is_hide = ?
                                        ORDER BY created_at DESC
                                        LIMIT ? OFFSET ?`,
    getAllAppsWithSearch: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                               WHERE (app_name LIKE ?)
                               ORDER BY created_at DESC
                               LIMIT ? OFFSET ?`,
    getAllAppsWithFilter: `SELECT *
                               FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                               WHERE is_hide = ?
                               ORDER BY created_at DESC
                               LIMIT ? OFFSET ?`,
    getAllAppsWithoutSearchAndFilter: `SELECT *
                                           FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                                           ORDER BY created_at DESC
                                           LIMIT ? OFFSET ?`,
    countAppsWithSearchAndFilter: `SELECT COUNT(*) as total
                                       FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                                       WHERE (app_name LIKE ?) AND is_hide = ?`,
    countAppsWithSearch: `SELECT COUNT(*) as total
                              FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                              WHERE (app_name LIKE ?)`,
    countAppsWithFilter: `SELECT COUNT(*) as total
                              FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                              WHERE is_hide = ?`,
    countAppsWithoutSearchAndFilter: `SELECT COUNT(*) as total
                                          FROM ${TABLE_NAMES.PORTFOLIO_APPS}`,
    getAppInformation: `SELECT *
                            FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                            WHERE app_id = ?`,
    addNewApp: `INSERT INTO ${TABLE_NAMES.PORTFOLIO_APPS} (app_name, app_icon, app_link)
                    VALUES (?, ?, ?)`,
    updateAppInformation: `UPDATE ${TABLE_NAMES.PORTFOLIO_APPS}
                               SET app_name = ?,
                                   app_link = ?
                               WHERE app_id = ?`,
    updateAppDisplayStatus: `UPDATE ${TABLE_NAMES.PORTFOLIO_APPS}
                                 SET is_hide = ?
                                 WHERE app_id = ?`,
    deleteApp: `DELETE
                    FROM ${TABLE_NAMES.PORTFOLIO_APPS}
                    WHERE app_id = ?`,
  },
};

module.exports = QueryString;

