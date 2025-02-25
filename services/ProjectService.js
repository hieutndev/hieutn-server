const BaseService = require("./BaseService");
const { projectSQL } = require("../utils/sql-query-string")
const s3Bucket = require("../configs/s3-bucket");
const Message = require("../utils/response-message");
const generateUniqueString = require("../utils/generate-unique-string");
const { compressText, decompressText } = require("../utils/zlib");
const { RESPONSE_CODE } = require("../constants/response-code")
class ProjectService extends BaseService {

	constructor() {
		super();
	}

	async insertProject(project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail, group_id, github_link, demo_link) {

		const insertStatus = await super.query(projectSQL.createNewProject, [project_fullname, project_shortname, start_date, end_date, short_description, project_thumbnail, group_id, github_link, demo_link]);

		if (!insertStatus.isCompleted) {
			throw new Error(insertStatus.message);
		}

		return insertStatus.results.insertId

	}

	async insertArticle(projectId, articleBody) {

		const compress = compressText(articleBody);

		const insertStatus = await super.query(projectSQL.createProjectArticle, [projectId, compress]);

		if (!insertStatus.isCompleted) {
			throw new Error(insertStatus.message)
		}

		return insertStatus.results.insertId;
	}

	async uploadProjectImageToS3(imageData, isResize = true, fit = "cover") {
		try {
			const imageName = generateUniqueString();
			await s3Bucket.putObject(imageName, imageData, isResize, fit)

			return {
				imageName,
			}
		} catch (error) {
			throw new Error(error)
		}
	}

	async removeImagesOnS3(listImageNames) {

		if (listImageNames.length === 0) {
			return true;
		}

		await Promise.all(listImageNames.map(async (imageName) => {
			await s3Bucket.deleteObject(imageName);
		}))

		return true;
	}

	async removeImageOnDB(projectId, listImageNames) {

		if (listImageNames.length === 0) {
			return true;
		}

		const mapQueryString = listImageNames.map(() => projectSQL.deleteProjectImage).join(";");
		const mapQueryValue = listImageNames.map((imageName) => [projectId, imageName]).flat();

		await super.queryMany(mapQueryString, mapQueryValue);

		return true;

	}

	async insertListImageNamesToDB(projectId, listImageName) {


		const mapListImage = listImageName.map(() => projectSQL.insertProjectImages).join(";");
		const mapListValue = listImageName.map((image) => [projectId, image.imageName]).flat();

		const insertStatus = await super.queryMany(mapListImage, mapListValue);

		if (!insertStatus.isCompleted) {
			throw new Error(insertStatus.message);
		}

	}

	async getListProjectImages(projectId, isParseUrl = false) {
		const listProjectImages = await super.query(projectSQL.getListProjectImages, [projectId]);

		if (!listProjectImages.isCompleted) {
			throw new Error(listProjectImages.message);
		}

		if (listProjectImages.results.length === 0) {
			return false;
		}

		return await Promise.all(listProjectImages.results.map(async (image) => ({
			...image,
			image_url: isParseUrl ? await s3Bucket.getObject(image.image_name) : null
		})));

	}

	async getProjectInfoById(projectId, isGetThumbnail = false, isGetListImages = false) {
		const projectInfo = await super.query(projectSQL.getProjectDetails, [projectId]);

		if (!projectInfo.isCompleted) {
			throw new Error(projectInfo.message);
		}

		if (projectInfo.results.length === 0) {
			return false;
		}

		const [projectThumbnailUrl, listProjectImages] = await Promise.all([isGetThumbnail && s3Bucket.getObject(projectInfo.results[0].project_thumbnail), isGetListImages && this.getListProjectImages(projectId, true)])

		return {
			...projectInfo.results[0],
			article_body: decompressText(projectInfo.results[0].article_body),
			project_thumbnail: projectThumbnailUrl,
			project_thumbnail_name: projectInfo.results[0].project_thumbnail,
			project_images: listProjectImages || []
		}

	}

	async createNewProject({
		project_fullname,
		project_shortname,
		start_date,
		end_date,
		short_description,
		article_body,
		group_id,
		github_link,
		demo_link
	}, thumbnail_file, project_images) {
		try {
			const { imageName } = await this.uploadProjectImageToS3(thumbnail_file);

			const listImageName = project_images ? await Promise.all(project_images.map(async (image) => {
				return this.uploadProjectImageToS3(image);
			})) : null;


			const newProjectId = await this.insertProject(project_fullname, project_shortname, start_date, end_date, short_description, imageName, group_id, github_link, demo_link);

			await Promise.all([this.insertArticle(newProjectId, article_body), project_images && this.insertListImageNamesToDB(newProjectId, listImageName)])

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE,
				results: {
					newProjectId
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
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
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

			const projectDetails = await this.getProjectInfoById(projectId, true, true);

			if (!projectDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: projectDetails
			}
		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateProjectThumbnail(is_change_thumbnail, project_thumbnail_name, thumbnail_file) {
		if (is_change_thumbnail === "true") {
			await s3Bucket.putObject(project_thumbnail_name, thumbnail_file, true, "cover");
		}
		return true
	}

	async updateProjectArticle(is_change_article, project_id, article_body) {

		if (is_change_article === "true") {

			const compress = compressText(article_body);

			const updateArticle = await super.query(projectSQL.updateArticle, [compress, project_id]);

			if (!updateArticle.isCompleted) {
				throw new Error(updateArticle.message);
			}
		}

		return true

	}

	async updateProjectDetails(project_id, {
		project_fullname,
		project_shortname,
		start_date,
		end_date,
		short_description,
		article_body,
		group_id,
		github_link,
		demo_link,
		is_change_thumbnail,
		is_change_article,
		remove_images,
	}, thumbnail_file, project_images) {
		try {

			const projectDetails = await this.getProjectInfoById(project_id);

			if (!projectDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}

			const updateProjectDetails = super.query(projectSQL.updateProjectDetails, [project_fullname, project_shortname, start_date, end_date, short_description, group_id !== 'null' ? group_id : null, github_link, demo_link, project_id]);
			const updateProjectThumbnail = this.updateProjectThumbnail(is_change_thumbnail, projectDetails.project_thumbnail_name, thumbnail_file)
			const updateProjectArticle = this.updateProjectArticle(is_change_article, project_id, article_body)


			const removeImages = JSON.parse(remove_images);

			const [updateProjectDetailsStatus, ,] = await Promise.all([updateProjectDetails,
				updateProjectThumbnail,
				updateProjectArticle,
				this.removeImagesOnS3(removeImages),
				this.removeImageOnDB(project_id, removeImages)]);

			if (!updateProjectDetailsStatus.isCompleted) {
				return {
					isCompleted: false,
					message: updateProjectDetailsStatus.message,
				}
			}

			if (project_images && project_images.length > 0) {
				const listImageName = await Promise.all(project_images.map(async (image) => {
					return this.uploadProjectImageToS3(image, false);
				}));

				await this.insertListImageNamesToDB(project_id, listImageName);
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
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

			const [projectDetails, listProjectImages] = await Promise.all([this.getProjectInfoById(projectId), this.getListProjectImages(projectId)]);


			if (!projectDetails) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
				}
			}


			const listImageNames = listProjectImages ? listProjectImages.results.map((image) => image.image_name) : [];

			await Promise.all([
				s3Bucket.deleteObject(projectDetails.project_thumbnail_name),
				super.queryMany(projectSQL.deleteProject, [projectId, projectId]),
				listProjectImages && this.removeImagesOnS3(listImageNames),
				listProjectImages && this.removeImageOnDB(projectId, listImageNames)
			])

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE,
			}


		} catch (error) {
			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async getAllProjectGroups() {

		const listProjectGroups = await super.query(projectSQL.getListProjectGroups);

		if (!listProjectGroups.isCompleted) {
			throw new Error(listProjectGroups.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ALL.CODE,
			results: listProjectGroups.results
		}
	}

	async getProjectGroupById(groupId) {
		const groupInfo = await super.query(projectSQL.getProjectGroupInfo, [groupId]);

		if (!groupInfo.isCompleted) {
			throw new Error(groupInfo.message);
		}

		if (groupInfo.results.length === 0) {
			return false;
		}

		return groupInfo.results[0];
	}

	async getProjectGroupInfo(groupId) {
		try {
			const groupInfo = await this.getProjectGroupById(groupId);

			if (!groupInfo) {
				return {
					isCompleted: false,
					message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
				}
			}

			return {
				isCompleted: true,
				message: RESPONSE_CODE.SUCCESS.SUCCESS_GET_ONE.CODE,
				results: groupInfo,
			}

		} catch (error) {
			throw error
		}
	}

	async createNewProjectGroup({ newGroupTitle }) {
		const createNewGroup = await super.query(projectSQL.createNewProjectGroup, [newGroupTitle]);

		if (!createNewGroup.isCompleted) {
			throw new Error(createNewGroup.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_CREATE.CODE
		}
	}

	async updateProjectGroupInfo(groupId, newGroupTitle) {
		const updateGroup = await super.query(projectSQL.updateProjectGroup, [newGroupTitle, groupId]);

		if (!updateGroup.isCompleted) {
			throw new Error(updateGroup.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_UPDATE.CODE,
		}
	}

	async softDeleteProjectGroup(groupId) {
		const groupInfo = await this.getProjectGroupById(groupId);

		if (!groupInfo) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
			}
		}

		if (groupInfo.is_deleted) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.ALREADY_IN_SOFT_DELETE.CODE
			}
		}

		const softDeleteGroup = await super.query(projectSQL.softDeleteGroup, [groupId]);

		if (!softDeleteGroup.isCompleted) {
			throw new Error(softDeleteGroup.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE
		}
	}

	async recoverProjectGroup(groupId) {

		const groupInfo = await this.getProjectGroupById(groupId);

		if (!groupInfo) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE,
			}
		}

		if (!groupInfo.is_deleted) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE,
			}
		}

		const recoverGroup = await super.query(projectSQL.recoverGroup, [groupId]);

		if (!recoverGroup.isCompleted) {
			throw new Error(recoverGroup.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_RECOVER.CODE
		}
	}

	async permanentDeleteProjectGroup(groupId) {

		const groupInfo = await this.getProjectGroupById(groupId);

		if (!groupInfo) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_FOUND.CODE
			}
		}

		if (!groupInfo.is_deleted) {
			return {
				isCompleted: false,
				message: RESPONSE_CODE.ERROR.NOT_IN_SOFT_DELETE.CODE
			}
		}

		const deleteGroup = await super.query(projectSQL.deleteProjectGroup, [groupId]);

		if (!deleteGroup.isCompleted) {
			throw new Error(deleteGroup.message);
		}

		return {
			isCompleted: true,
			message: RESPONSE_CODE.SUCCESS.SUCCESS_DELETE.CODE
		}
	}

}


module.exports = new ProjectService();