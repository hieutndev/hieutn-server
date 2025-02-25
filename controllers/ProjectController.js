const BaseController = require("./BaseController");
const ProjectService = require("../services/ProjectService");

class ProjectController extends BaseController {
	constructor() {
		super();
	}

	async createNewProject(req, res, next) {
		try {
			const {
				isCompleted,
				message,
				results
			} = await ProjectService.createNewProject(req.body, req.files.project_thumbnail && req.files.project_thumbnail[0], req.files.project_images)

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

			const {
				isCompleted,
				message
			} = await ProjectService.updateProjectDetails(projectId, req.body, req.files.project_thumbnail && req.files.project_thumbnail[0], req.files.project_images);

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