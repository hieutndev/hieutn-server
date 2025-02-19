const BaseController = require("./BaseController");
const ProjectService = require("../services/ProjectService");
const Message = require("../utils/response-message");

const s3Bucket = require("../configs/s3-bucket");
const generateUniqueString = require("../utils/generate-unique-string");

class ProjectController extends BaseController {
	constructor() {
		super();
	}

	async createNewProject(req, res, next) {
		try {

			const {
				project_fullname,
				project_shortname,
				start_date,
				end_date,
				short_description,
				article_body,
				group_id,
				github_link,
				demo_link
			} = req.body;


			const {
				isCompleted,
				message,
				results
			} = await ProjectService.createNewProject(project_fullname, project_shortname, start_date, end_date, short_description, article_body, group_id, req.file, github_link, demo_link)

			if (!isCompleted) {
				return next({
					status: 404,
					message,
					results: [],
				})
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAllProjects(req, res, next) {
		try {

			const { isCompleted, message, results } = await ProjectService.getAllProjects();

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getProjectDetails(req, res, next) {
		try {

			const { projectId } = req.params;

			const {
				isCompleted,
				message,
				results
			} = await ProjectService.getProjectDetails(projectId)

			if (!isCompleted) {
				return next({
					status: 404,
					message,
					results: [],
				})
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateProjectDetails(req, res, next) {
		try {

			const { projectId } = req.params;

			const { isCompleted, message } = await ProjectService.updateProject(projectId, req.body, req.file);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}


			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteProject(req, res, next) {
		try {

			const { projectId } = req.params;

			const { isCompleted, message } = await ProjectService.deleteProject(projectId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getListProjectGroups(req, res, next) {
		try {

			const { isCompleted, message, results } = await ProjectService.getAllProjectGroups();

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message, results)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async createNewProjectGroups(req, res, next) {
		try {


			const { isCompleted, message } = await ProjectService.createNewProjectGroup(req.body);


			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateProjectGroups(req, res, next) {
		try {

			const { groupId } = req.params;

			const { newGroupTitle } = req.body
			const { isCompleted, message } = await ProjectService.updateProjectGroupInfo(groupId, newGroupTitle);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const { isCompleted, message } = await ProjectService.softDeleteProjectGroup(groupId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}

	async recoverProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const { isCompleted, message } = await ProjectService.recoverProjectGroup(groupId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}

	async permanentDeleteProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const { isCompleted, message } = await ProjectService.permanentDeleteProjectGroup(groupId);

			if (!isCompleted) {
				return super.createResponse(res, 400, message);
			}

			return super.createResponse(res, 200, message);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}
}

module.exports = new ProjectController()