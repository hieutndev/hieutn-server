const BaseService = require("./BaseService");
const { projectSQL } = require("../utils/sql-query-string")
const s3Bucket = require("../configs/s3-bucket");
const Message = require("../utils/response-message");
const generateUniqueString = require("../utils/generate-unique-string");
const { compressText, decompressText } = require("../utils/zlib");

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

			const compress = compressText(articleBody);

			const insertStatus = await super.query(projectSQL.createProjectArticle, [projectId, compress]);

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

	async uploadProjectImageToS3(imageData) {
		try {
			const imageName = generateUniqueString();
			await s3Bucket.putObject(imageName, imageData, true, "cover")

			return {
				imageName,
			}
		} catch (error) {
			throw new Error(error)
		}

	}

	async removeImagesOnS3(listImageNames) {
		return await Promise.all(listImageNames.map(async (imageName) => {
			await s3Bucket.deleteObject(imageName);
		}))
	}

	async removeImageOnDB(projectId, listImageNames) {
		const mapQueryString = listImageNames.map(() => projectSQL.deleteProjectImage).join(";");
		const mapQueryValue = listImageNames.map((imageName) => [projectId, imageName]).flat();

		return await super.queryMany(mapQueryString, mapQueryValue);

	}

	async insertListImageNamesToDB(projectId, listImageName) {


		const mapListImage = listImageName.map(() => projectSQL.insertProjectImages).join(";");
		const mapListValue = listImageName.map((image) => [projectId, image.imageName]).flat();

		const insertStatus = await super.queryMany(mapListImage, mapListValue);

		if (!insertStatus.isCompleted) {
			throw new Error(insertStatus.message);
		}

	}

	async getListProjectImages(projectId) {
		const listProjectImages = await super.query(projectSQL.getListProjectImages, [projectId]);

		if (!listProjectImages.isCompleted) {
			throw new Error(listProjectImages.message);
		}

		return await Promise.all(listProjectImages.results.map(async (image) => ({
			...image,
			image_url: await s3Bucket.getObject(image.image_name)
		})));

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

			const listImageName = await Promise.all(project_images.map(async (image) => {
				return this.uploadProjectImageToS3(image);
			}));

			const createProject = await this.insertProject(project_fullname, project_shortname, start_date, end_date, short_description, imageName, group_id, github_link, demo_link);

			if (!createProject.isCompleted) {
				return {
					isCompleted: false,
					message: createProject.message,
				}
			}

			const createArticle = await this.insertArticle(createProject.results.insertId, article_body);

			await this.insertListImageNamesToDB(createProject.results.insertId, listImageName);

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

			const getListProjectImages = await this.getListProjectImages(projectId);

			return {
				isCompleted: true,
				message: Message.successGetOne("project"),
				results: {
					...projectDetails.results[0],
					article_body: decompressText(projectDetails.results[0].article_body),
					project_thumbnail: getProjectThumbnailUrl,
					project_thumbnail_name: projectDetails.results[0].project_thumbnail,
					project_images: getListProjectImages
				}
			}
		} catch (error) {

			return {
				isCompleted: false,
				message: error,
			}
		}
	}

	async updateProjectThumbnail(is_change_thumbnail, project_id, thumbnail_file) {
		try {
			if (is_change_thumbnail === "true") {
				const projectDetails = await this.getProjectDetails(project_id);

				if (!projectDetails.isCompleted) {
					return {
						isCompleted: false,
						message: projectDetails.message,
					}
				}

				await s3Bucket.putObject(projectDetails.results.project_thumbnail_name, thumbnail_file, true, "cover");

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

	async updateProjectArticle(is_change_article, project_id, article_body) {
		try {
			if (is_change_article === "true") {

				const compress = compressText(article_body);

				const updateArticle = await super.query(projectSQL.updateArticle, [compress, project_id]);

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


			const updateProjectDetails = await super.query(projectSQL.updateProjectDetails, [project_fullname, project_shortname, start_date, end_date, short_description, group_id !== 'null' ? group_id : null, github_link, demo_link, project_id]);

			if (!updateProjectDetails.isCompleted) {
				return {
					isCompleted: false,
					message: updateProjectDetails.message,
				}
			}
			const [updateThumbnail, updateArticle] = await Promise.all([this.updateProjectThumbnail(is_change_thumbnail, project_id, thumbnail_file), this.updateProjectArticle(is_change_article, project_id, article_body)]);

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

			const removeImages = JSON.parse(remove_images);

			if (removeImages.length > 0) {
				await Promise.all([this.removeImagesOnS3(removeImages), this.removeImageOnDB(project_id, removeImages)]);
			}

			if (project_images && project_images.length > 0) {
				const listImageName = await Promise.all(project_images.map(async (image) => {
					return this.uploadProjectImageToS3(image);
				}));

				await this.insertListImageNamesToDB(project_id, listImageName);
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

			const [projectDetails, listProjectImages] = await Promise.all([super.query(projectSQL.getProjectDetails, [projectId]), await super.query(projectSQL.getListProjectImages, [projectId])]);


			if (!projectDetails.isCompleted) {
				return {
					isCompleted: false,
					message: projectDetails.message,
				}
			}

			if (!listProjectImages.isCompleted) {
				return {
					isCompleted: false,
					message: projectDetails.message,
				}
			}

			const listImageNames = listProjectImages.results.map((image) => image.image_name);


			await Promise.all([this.removeImagesOnS3(listImageNames), this.removeImageOnDB(projectId, listImageNames), s3Bucket.deleteObject(projectDetails.results[0].project_thumbnail), super.queryMany(projectSQL.deleteProject, [projectId, projectId])]);

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