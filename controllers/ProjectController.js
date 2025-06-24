const BaseController = require("./BaseController");
const ProjectService = require("../services/ProjectService");
const { RESPONSE_CODE } = require("../constants/response-code")
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

			const projectThumbnail = req.files.project_thumbnail && req.files.project_thumbnail[0];

			const projectImages = req.files.project_images;

			const projectThumbnailName = `projectThumbnail_${generateUniqueString()}`;

			const projectImageNames = projectImages ? projectImages.map((_v) => `projectImage_${generateUniqueString()}`) : [];

			const newProjectId = await ProjectService.insertProject(project_fullname, project_shortname, start_date, end_date, short_description, projectThumbnailName, group_id, github_link, demo_link);

			await Promise.all([
				ProjectService.insertArticle(newProjectId, article_body),
				ProjectService.insertListProjectImageNames(newProjectId, projectImageNames),
				projectThumbnail && ProjectService.uploadProjectThumbnail(projectThumbnail, projectThumbnailName),
				projectImages && projectImages.map((imageFile, index) => ProjectService.uploadProjectImage(imageFile, projectImageNames[index])),
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_ADD_PROJECT, {
				newProjectId
			})

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getAllProjects(req, res, next) {
		try {

			const listProjects = await ProjectService.getAllProjects();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_PROJECTS, listProjects)


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getProjectDetails(req, res, next) {
		try {

			const { projectId } = req.params;

			const projectInfo = await ProjectService.getProjectInfoById(projectId, true, true);

			if (!projectInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_NOT_FOUND);
			}

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_PROJECT_INFO, projectInfo)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateProjectDetails(req, res, next) {
		try {

			const { projectId } = req.params;

			const {
				project_fullname,
				project_shortname,
				start_date,
				end_date,
				short_description,
				article_body,
				group_id,
				github_link,
				demo_link,
				remove_images,
			} = req.body;

			const projectThumbnail = req.files.project_thumbnail && req.files.project_thumbnail[0];

			const projectImages = req.files.project_images;

			const projectImageNames = projectImages ? projectImages.map((_v) => `projectImage_${generateUniqueString()}`) : [];

			const projectInfo = await ProjectService.getProjectInfoById(projectId);

			if (!projectInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_NOT_FOUND);
			}

			const removeImages = JSON.parse(remove_images);

			await Promise.all([
				ProjectService.updateProjectDetails(projectId, project_fullname, project_shortname, start_date, end_date, short_description, group_id, github_link, demo_link),
				removeImages && removeImages.map((imageName) => ProjectService.s3Delete(imageName)),
				ProjectService.removeListProjectImageNames(projectId, removeImages),
				projectThumbnail && ProjectService.uploadProjectThumbnail(projectThumbnail, projectInfo.project_thumbnail_name),
				projectImages && projectImages.map((imageFile, index) => ProjectService.uploadProjectImage(imageFile, projectImageNames[index])),
				ProjectService.insertListProjectImageNames(projectId, projectImageNames),
				ProjectService.updateProjectArticle(projectId, article_body),
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_PROJECT_INFO);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async deleteProject(req, res, next) {
		try {

			const { projectId } = req.params;

			const projectInfo = await ProjectService.getProjectInfoById(projectId);

			if (!projectInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_NOT_FOUND);
			}

			const listProjectImages = (await ProjectService.getListProjectImages(projectId)).map((img) => img.image_name);


			await Promise.all([
				ProjectService.deleteProject(projectId),
				ProjectService.s3Delete(projectInfo.project_thumbnail_name),
				ProjectService.removeListProjectImageNames(projectId, listProjectImages),
				listProjectImages && listProjectImages.map((imageName) => ProjectService.s3Delete(imageName))
			])

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_PROJECT)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async getListProjectGroups(req, res, next) {
		try {

			const listGroups = await ProjectService.getAllProjectGroups();

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_GET_ALL_PROJECT_GROUPS, listGroups)

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async createNewProjectGroups(req, res, next) {
		try {

			const { newGroupTitle } = req.body

			const newGroupId = await ProjectService.createNewProjectGroup(newGroupTitle);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_CREATE_PROJECT_GROUP, {
				newGroupId
			})


		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async updateProjectGroups(req, res, next) {
		try {

			const { groupId } = req.params;

			const { newGroupTitle } = req.body

			const groupInfo = await ProjectService.getGroupById(groupId);

			if (!groupInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_GROUP_NOT_FOUND);
			}

			await ProjectService.updateProjectGroupInfo(groupId, newGroupTitle);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_UPDATE_PROJECT_GROUP_INFO);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}
	}

	async softDeleteProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const groupInfo = await ProjectService.getGroupById(groupId);

			if (!groupInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_GROUP_NOT_FOUND);
			}

			if (groupInfo.is_deleted === 1) {
				return super.createResponse(res, 404, RESPONSE_CODE.ALREADY_IN_SOFT_DELETE);
			}

			await ProjectService.softDeleteProjectGroup(groupId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_PROJECT_GROUP);
		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}

	async recoverProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const groupInfo = await ProjectService.getGroupById(groupId);

			if (!groupInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_GROUP_NOT_FOUND);
			}

			if (groupInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.NOT_IN_SOFT_DELETE);
			}

			await ProjectService.recoverProjectGroup(groupId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_RECOVER_PROJECT_GROUP);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}

	async permanentDeleteProjectGroup(req, res, next) {
		try {

			const { groupId } = req.params;

			const groupInfo = await ProjectService.getGroupById(groupId);

			if (!groupInfo) {
				return super.createResponse(res, 404, RESPONSE_CODE.PROJECT_GROUP_NOT_FOUND);
			}

			if (groupInfo.is_deleted === 0) {
				return super.createResponse(res, 404, RESPONSE_CODE.NOT_IN_SOFT_DELETE);
			}

			await ProjectService.permanentDeleteProjectGroup(groupId);

			return super.createResponse(res, 200, RESPONSE_CODE.SUCCESS_DELETE_PROJECT_GROUP);

		} catch (error) {
			return super.createResponse(res, 500, error)
		}

	}
}

module.exports = new ProjectController()