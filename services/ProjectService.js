const BaseService = require("./BaseService");
const { projectSQL } = require("../utils/SQLQueryString")
const s3Bucket = require("../configs/s3Bucket");
const Message = require("../utils/ResponseMessage");

class ProjectService extends BaseService {

	constructor() {
		super();
	}

	async insertProject(project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail) {
		try {
			const insertStatus = await super.query(projectSQL.createNewProject, [project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail]);

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

	async createNewProject(project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail, article_body) {
		try {
			const createProject = await this.insertProject(project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail);

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
					project_thumbnail: getProjectThumbnailUrl
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
				const projectDetails = await super.query(projectSQL.getProjectDetails, [projectId]);

				if (!projectDetails.isCompleted) {
					return {
						isCompleted: false,
						message: projectDetails.message,
					}
				}

				await s3Bucket.putObject(projectDetails.results[0].project_thumbnail, thumbnailFile, true);

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
		isChangeThumbnail,
		isChangeArticle,
	}, thumbnailFile) {
		try {

			const updateProjectDetails = await super.query(projectSQL.updateProjectDetails, [project_fullname, project_shortname, start_date, end_date, short_description, projectId]);

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
}

module.exports = new ProjectService();