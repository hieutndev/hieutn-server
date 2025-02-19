const BaseService = require("./BaseService");
const { projectSQL } = require("../utils/sql-query-string")
const s3Bucket = require("../configs/s3-bucket");
const Message = require("../utils/response-message");
const generateUniqueString = require("../utils/generate-unique-string");

class ProjectService extends BaseService {

	constructor() {
		super();
	}

	async insertProject(project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail, group_id, github_link, demo_link) {
		try {
			const insertStatus = await super.query(projectSQL.createNewProject, [project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail, group_id, github_link, demo_link]);

			if (!insertStatus.isCompleted) {
				return {
					isCompleted: false,
					message: insertStatus.message,
				}
			}

			return {
				isCompleted: true,
				results: insertStatus.results
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async insertArticle(projectId, articleBody) {
		try {
			const insertStatus = await super.query(projectSQL.createProjectArticle, [projectId, articleBody]);

			if (!insertStatus.isCompleted) {
				return {
					isCompleted: false,
					message: insertStatus.message
				}
			}

			return {
				isCompleted: true,
				results: insertStatus.results
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async createNewProject(project_fullname, project_shortname, start_date, end_date, short_description, article_body, group_id, thumbnail_file, github_link, demo_link) {
		try {
			const imageName = generateUniqueString();

			const createProject = await this.insertProject(project_fullname, project_shortname, start_date, end_date, short_description, imageName, group_id, github_link, demo_link);

			if (!createProject.isCompleted) {
				return {
					isCompleted: false,
					message: createProject.message,
				}
			}

			const createArticle = await this.insertArticle(createProject.results.insertId, article_body);

			if (!createArticle.isCompleted) {
				return {
					isCompleted: false,
					message: createArticle.message,
				}
			}


			await s3Bucket.putObject(imageName, thumbnail_file, true, "cover")

			return {
				isCompleted: true,
				message: Message.successCreate("project"),
				results: {
					newProjectId: createProject.results.insertId
				}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAllProjects() {
		try {
			const listProjects = await super.query(projectSQL.getAllProjects);

			if (!listProjects.isCompleted) {
				return {
					isCompleted: false,
					message: listProjects.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successGetAll("projects"),
				results: listProjects.results
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getProjectDetails(projectId) {
		try {

			const projectDetails = await super.query(projectSQL.getProjectDetails, [projectId]);

			if (!projectDetails.isCompleted) {
				return {
					isCompleted: false,
					message: projectDetails.message,
				}
			}

			if (projectDetails.results.length === 0) {
				return {
					isCompleted: false,
					message: "Project not found",
				}
			}

			const getProjectThumbnailUrl = await s3Bucket.getObject(projectDetails.results[0].project_thumbnail);

			return {
				isCompleted: true,
				message: Message.successGetOne("project"),
				results: {
					...projectDetails.results[0],
					project_thumbnail: getProjectThumbnailUrl,
					project_thumbnail_name: projectDetails.results[0].project_thumbnail
				}
			}
		} catch (error) {

			return {
				isCompleted: false,
				message: error,
			}
		}
	}


	async updateProjectThumbnail(isChangeThumbnail, projectId, thumbnailFile) {
		try {
			if (isChangeThumbnail === "true") {
				const projectDetails = await this.getProjectDetails(projectId);

				if (!projectDetails.isCompleted) {
					return {
						isCompleted: false,
						message: projectDetails.message,
					}
				}

				await s3Bucket.putObject(projectDetails.results.project_thumbnail_name, thumbnailFile, true, "cover");

			}
			return {
				isCompleted: true,
			}
		} catch (error) {

			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateProjectArticle(isChangeArticle, projectId, article_body) {
		try {
			if (isChangeArticle === "true") {
				const updateArticle = await super.query(projectSQL.updateArticle, [article_body, projectId]);

				if (!updateArticle.isCompleted) {
					return {
						isCompleted: false,
						message: updateArticle.message,
					}
				}
			}


			return {
				isCompleted: true,
			}
		} catch (error) {

			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateProject(projectId, {
		project_fullname,
		project_shortname,
		start_date,
		end_date,
		short_description,
		article_body,
		group_id,
		github_link,
		demo_link,
		isChangeThumbnail,
		isChangeArticle,
	}, thumbnailFile) {
		try {

			const updateProjectDetails = await super.query(projectSQL.updateProjectDetails, [project_fullname, project_shortname, start_date, end_date, short_description, group_id !== 'null' ? group_id : null, github_link, demo_link, projectId]);

			if (!updateProjectDetails.isCompleted) {
				return {
					isCompleted: false,
					message: updateProjectDetails.message,
				}
			}

			const [updateThumbnail, updateArticle] = await Promise.all([this.updateProjectThumbnail(isChangeThumbnail, projectId, thumbnailFile), this.updateProjectArticle(isChangeArticle, projectId, article_body)]);

			if (!updateThumbnail.isCompleted) {
				return {
					isCompleted: false,
					message: updateThumbnail.message,
				}
			}

			if (!updateArticle.isCompleted) {
				return {
					isCompleted: false,
					message: updateArticle.message,
				}
			}

			return {
				isCompleted: true,
				message: Message.successUpdate("project details")
			}

		} catch (error) {

			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async deleteProject(projectId) {
		try {

			const projectDetails = await super.query(projectSQL.getProjectDetails, [projectId]);

			if (!projectDetails.isCompleted) {
				return {
					isCompleted: false,
					message: projectDetails.message,
				}
			}

			await Promise.all([s3Bucket.deleteObject(projectDetails.results[0].project_thumbnail), super.queryMany(projectSQL.deleteProject, [projectId, projectId])]);

			return {
				isCompleted: true,
				message: Message.successDelete("project")
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAllProjectGroups() {
		try {
			const listProjectGroups = await super.query(projectSQL.getListProjectGroups);

			return {
				isCompleted: listProjectGroups.isCompleted,
				message: listProjectGroups.isCompleted ? Message.successGetAll("project groups") : listProjectGroups.message,
				results: listProjectGroups.results
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error
			}
		}
	}

	async getProjectGroupInfo(groupId) {
		try {

			const groupInfo = await super.query(projectSQL.getProjectGroupInfo, [groupId]);

			return {
				isCompleted: groupInfo.isCompleted,
				message: groupInfo.isCompleted ? Message.successGetOne("project group") : groupInfo.message,
				results: groupInfo.isCompleted ? groupInfo.results[0] : {}
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async createNewProjectGroup({ newGroupTitle }) {

		try {

			const createNewGroup = await super.query(projectSQL.createNewProjectGroup, [newGroupTitle]);

			return {
				isCompleted: createNewGroup.isCompleted,
				message: createNewGroup.isCompleted ? Message.successCreate("project group") : createNewGroup.message,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}

	}

	async updateProjectGroupInfo(groupId, newGroupTitle) {
		try {
			const updateGroup = await super.query(projectSQL.updateProjectGroup, [newGroupTitle, groupId]);

			return {
				isCompleted: updateGroup.isCompleted,
				message: updateGroup.isCompleted ? Message.successUpdate("project group") : updateGroup.message,
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async softDeleteProjectGroup(groupId) {
		try {

			const groupInfo = await this.getProjectGroupInfo(groupId);

			if (!groupInfo.isCompleted) {
				return {
					isCompleted: false,
					message: groupInfo.message
				}
			}

			if (groupInfo.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.alreadyInSoftDelete("project group")
				}
			}

			const softDeleteGroup = await super.query(projectSQL.softDeleteGroup, [groupId]);

			return {
				isCompleted: softDeleteGroup.isCompleted,
				message: softDeleteGroup.isCompleted ? Message.successDelete("project group") : softDeleteGroup.message
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async recoverProjectGroup(groupId) {
		try {

			const groupInfo = await this.getProjectGroupInfo(groupId);

			if (!groupInfo.isCompleted) {
				return {
					isCompleted: false,
					message: groupInfo.message
				}
			}

			if (!groupInfo.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("project group")
				}
			}

			const recoverGroup = await super.query(projectSQL.recoverGroup, [groupId]);

			return {
				isCompleted: recoverGroup.isCompleted,
				message: recoverGroup.isCompleted ? Message.successRecover("project group") : recoverGroup.message
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async permanentDeleteProjectGroup(groupId) {
		try {

			const groupInfo = await this.getProjectGroupInfo(groupId);

			if (!groupInfo.isCompleted) {
				return {
					isCompleted: false,
					message: groupInfo.message
				}
			}

			if (!groupInfo.results.is_deleted) {
				return {
					isCompleted: false,
					message: Message.notInSoftDelete("project group")
				}
			}

			const deleteGroup = await super.query(projectSQL.deleteProjectGroup, [groupId]);

			return {
				isCompleted: deleteGroup.isCompleted,
				message: deleteGroup.isCompleted ? Message.successRecover("project group") : deleteGroup.message
			}

		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}
}


module.exports = new ProjectService();