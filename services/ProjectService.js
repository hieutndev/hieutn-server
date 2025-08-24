const BaseService = require("./BaseService");
const { projectSQL } = require("../utils/sql-query-string")
const s3Bucket = require("../configs/s3-bucket");
const generateUniqueString = require("../utils/generate-unique-string");
const { compressText, decompressText } = require("../utils/zlib");
const { RESPONSE_CODE } = require("../constants/response-code")

class ProjectService extends BaseService {

	constructor() {
		super();
	}

	async uploadProjectThumbnail(imageFile, projectThumbnailName) {
		return super.s3Upload(imageFile, {
			imageName: projectThumbnailName,
			fit: 'contain',
			isResize: true,
			width: 1920,
			height: 1080,
		});
	}

	async uploadProjectImage(imageFile, projectImageName) {
		return super.s3Upload(imageFile, {
			imageName: projectImageName,
			isResize: false
		});
	}


	async insertProject(projectFullName, projectShortName, slug, startDate, endDate, shortDescription, projectThumbnail, groupId, githubLink, demoLink) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(projectSQL.createNewProject, [projectFullName, projectShortName, slug, startDate, endDate, shortDescription, projectThumbnail, groupId, githubLink, demoLink]);

		if (!isCompleted) {
			throw message
		}

		return results.insertId

	}

	async insertArticle(projectId, articleBody) {

		const compress = compressText(articleBody);

		const insertStatus = await super.query(projectSQL.createProjectArticle, [projectId, compress]);

		if (!insertStatus.isCompleted) {
			throw new Error(insertStatus.message)
		}

		return insertStatus.results.insertId;
	}

	async removeListProjectImageNames(projectId, listImageNames) {
		if (listImageNames.length < 1) {
			return true;
		}

		const mapQueryString = listImageNames.map(() => projectSQL.deleteProjectImage).join(";");
		const mapQueryValue = listImageNames.map((imageName) => [projectId, imageName]).flat();

		await super.queryMany(mapQueryString, mapQueryValue);

		return true;

	}

	async insertListProjectImageNames(projectId, listProjectImageNames) {

		if (listProjectImageNames.length < 1) {
			return true;
		}

		const mapListImage = listProjectImageNames.map(() => projectSQL.insertProjectImages).join(";");
		const mapListValue = listProjectImageNames.map((image) => [projectId, image]).flat();

		const { isCompleted, message } = await super.queryMany(mapListImage, mapListValue);

		if (!isCompleted) {
			throw message;
		}

		return true;

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

	async checkSlugExists(slug, excludeProjectId = 0) {
		const result = await super.query(projectSQL.checkSlugExists, [slug, excludeProjectId]);

		if (!result.isCompleted) {
			throw new Error(result.message);
		}

		return result.results[0].count > 0;
	}

	async getProjectInfoBySlug(slug, isGetThumbnail = false, isGetListImages = false) {
		const projectInfo = await super.query(projectSQL.getProjectDetailsBySlug, [slug]);

		if (!projectInfo.isCompleted) {
			throw new Error(projectInfo.message);
		}

		if (projectInfo.results.length === 0) {
			return false;
		}

		const projectId = projectInfo.results[0].id;
		const [projectThumbnailUrl, listProjectImages] = await Promise.all([isGetThumbnail && projectInfo.results[0].project_thumbnail && s3Bucket.getObject(projectInfo.results[0].project_thumbnail), isGetListImages && this.getListProjectImages(projectId, true)])

		return {
			...projectInfo.results[0],
			article_body: decompressText(projectInfo.results[0].article_body),
			project_thumbnail: projectThumbnailUrl,
			project_thumbnail_name: projectInfo.results[0].project_thumbnail,
			project_images: listProjectImages || []
		}

	}

	async getProjectInfoById(projectId, isGetThumbnail = false, isGetListImages = false) {
		const projectInfo = await super.query(projectSQL.getProjectDetails, [projectId]);

		if (!projectInfo.isCompleted) {
			throw new Error(projectInfo.message);
		}

		if (projectInfo.results.length === 0) {
			return false;
		}
		console.log(projectInfo.results);
		

		const [projectThumbnailUrl, listProjectImages] = await Promise.all([isGetThumbnail && projectInfo.results[0].project_thumbnail && s3Bucket.getObject(projectInfo.results[0].project_thumbnail), isGetListImages && this.getListProjectImages(projectId, true)])

		return {
			...projectInfo.results[0],
			article_body: decompressText(projectInfo.results[0].article_body),
			project_thumbnail: projectThumbnailUrl,
			project_thumbnail_name: projectInfo.results[0].project_thumbnail,
			project_images: listProjectImages || []
		}

	}

	async getAllProjects(options = {}) {
		const {
			search = '',
			page = 1,
			limit = 10
		} = options;

		// Calculate offset for pagination
		const offset = (page - 1) * limit;

		let countQuery, dataQuery, countParams, dataParams;

		if (search && search.trim()) {
			const searchTerm = `%${search.trim()}%`;

			// Use search queries
			countQuery = projectSQL.countProjectsWithSearch;
			dataQuery = projectSQL.getAllProjectsWithSearch;
			countParams = [searchTerm, searchTerm, searchTerm, searchTerm];
			dataParams = [searchTerm, searchTerm, searchTerm, searchTerm, limit, offset];
		} else {
			// Use non-search queries
			countQuery = projectSQL.countProjectsWithoutSearch;
			dataQuery = projectSQL.getAllProjectsWithoutSearch;
			countParams = [];
			dataParams = [limit, offset];
		}

		// Get total count for pagination
		const { isCompleted: countCompleted, message: countMessage, results: countResults } = await super.query(countQuery, countParams);

		if (!countCompleted) {
			throw countMessage;
		}

		const totalCount = countResults[0].total;

		// Get paginated results
		const { isCompleted, message, results } = await super.query(dataQuery, dataParams);

		if (!isCompleted) {
			throw message;
		}

		return {
			results,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit)
		};
	}

	async updateProjectArticle(projectId, articleBody) {
		const compress = compressText(articleBody);

		const { isCompleted, message } = await super.query(projectSQL.updateArticle, [compress, projectId]);

		if (!isCompleted) {
			throw message;
		}

		return true

	}

	async updateProjectDetails(projectId,
							   projectFullName,
							   projectShortName,
							   slug,
							   startDate,
							   endDate,
							   shortDescription,
							   groupId,
							   githubLink,
							   demoLink
	) {

		const {
			isCompleted,
			message,
			results
		} = await super.query(projectSQL.updateProjectDetails, [projectFullName, projectShortName, slug, startDate, endDate, shortDescription, groupId !== 'null' ? groupId : null, githubLink, demoLink, projectId]);

		if (!isCompleted) {
			throw message;
		}

		return true


	}

	async deleteProject(projectId) {

		const { isCompleted, message } = await super.queryMany(projectSQL.deleteProject, [projectId, projectId]);

		if (!isCompleted) {
			throw message;
		}

		return true

	}

	async getAllProjectGroups() {

		const { isCompleted, message, results } = await super.query(projectSQL.getListProjectGroups);

		if (!isCompleted) {
			throw message;
		}

		return results;
	}

	async getGroupById(groupId) {
		const { isCompleted, message, results } = await super.query(projectSQL.getProjectGroupInfo, [groupId]);

		if (!isCompleted) {
			throw message;
		}

		if (results.length === 0) {
			return false;
		}

		return results[0];
	}

	async createNewProjectGroup(newGroupTitle) {
		const { isCompleted, message, results } = await super.query(projectSQL.createNewProjectGroup, [newGroupTitle]);

		if (!isCompleted) {
			throw message;
		}

		return results.insertId;
	}

	async updateProjectGroupInfo(groupId, newGroupTitle) {
		const {
			isCompleted,
			message,
			results
		} = await super.query(projectSQL.updateProjectGroup, [newGroupTitle, groupId]);

		if (!isCompleted) {
			throw message;
		}

		return true;
	}

	async softDeleteProjectGroup(groupId) {

		const { isCompleted, message, results } = await super.query(projectSQL.softDeleteGroup, [groupId]);

		if (!isCompleted) {
			throw message;
		}

		return true;
	}

	async recoverProjectGroup(groupId) {

		const { isCompleted, message } = await super.query(projectSQL.recoverGroup, [groupId]);

		if (!isCompleted) {
			throw message;
		}

		return true
	}

	async permanentDeleteProjectGroup(groupId) {

		const groupInfo = await this.getGroupById(groupId);


		const { isCompleted, message } = await super.query(projectSQL.deleteProjectGroup, [groupId]);

		if (!isCompleted) {
			throw message;
		}

		return true;
	}

	async increaseProjectView(projectId) {
		const { isCompleted, message } = await super.query(projectSQL.increaseProjectView, [projectId]);

		if (!isCompleted) {
			throw message;
		}

		return true;

	}

	async getTopViewedArticles() {
		const { isCompleted, message, results } = await super.query(projectSQL.getTopViewedArticles);

		if (!isCompleted) {
			throw message;
		}

		return results;
	}

}


module.exports = new ProjectService();