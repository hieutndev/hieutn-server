const BaseController = require("./BaseController");
const ProjectService = require("../services/ProjectService");
const Message = require("../utils/ResponseMessage");

const s3Bucket = require("../configs/s3Bucket");
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
				article_body
			} = req.body;

			const imageName = generateUniqueString();


			const {
				isCompleted,
				message,
				results
			} = await ProjectService.createNewProject(project_fullname, project_shortname, start_date, end_date, short_description, imageName, article_body)

			if (!isCompleted) {
				return next({
					status: 404,
					message,
					results: [],
				})
			}

			await s3Bucket.putObject(imageName, req.file, true)

			return super.createSuccessResponse(res, 200, Message.successCreate("project"), results)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getAllProjects(req, res, next) {
		try {

			const { isCompleted, message, results } = await ProjectService.getAllProjects();

			if (!isCompleted) {
				return next({
					status: 404,
					message
				})
			}

			return super.createSuccessResponse(res, 200, Message.successGetAll("projects"), results)
			// return super.createSuccessResponse(res, 400, Message.successGetAll("projects"), results)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
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

			return super.createSuccessResponse(res, 200, Message.successGetOne("project"), results)

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async updateProjectDetails(req, res, next) {
		try {

			const { projectId } = req.params;

			const { isCompleted, message } = await ProjectService.updateProject(projectId, req.body, req.file);

			if (!isCompleted) {
				return next({
					status: 404,
					message,
				})
			}


			return super.createSuccessResponse(res, 200, Message.successUpdate("project details"))

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async deleteProject(req, res, next) {
		try {

			const { projectId } = req.params;

			const { isCompleted, message } = await ProjectService.deleteProject(projectId);

			if (!isCompleted) {
				return next({
					status: 404,
					message,
				})
			}

			return super.createSuccessResponse(res, 200, Message.successDelete("project"))

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new ProjectController()