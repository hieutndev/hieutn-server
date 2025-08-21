const BaseController = require("./BaseController");
const GoogleAnalyticsService = require("../services/GoogleAnalyticsService");
const GoogleSearchConsoleService = require("../services/GoogleSearchConsoleService");
const { getDateRange } = require("../utils/date");

class AnalyticsController extends BaseController {
	constructor() {
		super();
	}

	// Get dashboard analytics data
	async getDashboard(req, res) {
		try {
			const { period = '30days' } = req.query;

			// Calculate date range based on period
			const { startDate, endDate, previousStartDate, previousEndDate } = getDateRange(period);

			// Fetch data from services in parallel
			const [
				gAnalyticsTrafficData,
				gSearchConsoleQueries,
				gAnalyticsTopPages,
				currentMetrics,
				previousMetrics
			] = await Promise.all([
				GoogleAnalyticsService.getTrafficData(startDate, endDate),
				GoogleSearchConsoleService.getTopQueries(startDate, endDate),
				GoogleAnalyticsService.getTopPages(startDate, endDate),
				GoogleAnalyticsService.getUserMetrics(startDate, endDate),
				GoogleAnalyticsService.getUserMetrics(previousStartDate, previousEndDate),
			]);
			console.log("🚀 ~ AnalyticsController ~ getDashboard ~ gaTrafficData:", gAnalyticsTrafficData)

			


			// Calculate percentage changes
			const calculateChange = (current, previous) => {
				if (!previous || previous === 0) return { changePercentage: 0, changeType: 'neutral' };
				const change = ((current - previous) / previous) * 100;
				return {
					changePercentage: Math.abs(change),
					changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'
				};
			};

			// Calculate total clicks from traffic data
			const totalClicks = gAnalyticsTrafficData.reduce((sum, day) => sum + day.clicks, 0);

			const previousTrafficData = await GoogleAnalyticsService.getTrafficData(previousStartDate, previousEndDate);
			const previousTotalClicks = previousTrafficData.reduce((sum, day) => sum + day.clicks, 0);
			
			// Calculate engagement time from traffic data
			const totalEngagementTime = gAnalyticsTrafficData.reduce((sum, day) => sum + day.engagementTime, 0);
			const previousTotalEngagementTime = previousTrafficData.reduce((sum, day) => sum + day.engagementTime, 0);
		

			// Build response with real and calculated data
			const dashboardData = {
				analytics: {
					currentPeriod: {
						views: {
							value: currentMetrics.totalViews || currentMetrics.sessions || 0,
							previousValue: previousMetrics.totalViews || previousMetrics.sessions || 0,
							...calculateChange(
								currentMetrics.totalViews || currentMetrics.sessions || 0,
								previousMetrics.totalViews || previousMetrics.sessions || 0
							)
						},
						clicks: {
							value: totalClicks || 0,
							previousValue: previousTotalClicks || 0,
							...calculateChange(totalClicks || 0, previousTotalClicks || 0)
						},
						engagementTime: {
							value: totalEngagementTime || 0,
							previousValue: previousTotalEngagementTime || 0,
							...calculateChange(totalEngagementTime || 0, previousTotalEngagementTime || 0)
						}
					},
					trafficTrends: gAnalyticsTrafficData,
					period
				},
				topPages: gAnalyticsTopPages,
				topQueries: gSearchConsoleQueries
			};

			return super.createResponse(res, 200, "SUCCESS", dashboardData);
		} catch (error) {
			console.error('Analytics Dashboard Error:', error);
			return super.createResponse(res, 500, error);
		}
	}

	// Get traffic data
	async getTraffic(req, res) {
		try {
			const { period = '30days' } = req.query;
			const { startDate, endDate } = getDateRange(period);

			const trafficData = await GoogleAnalyticsService.getTrafficData(startDate, endDate);

			const responseData = {
				trafficTrends: trafficData,
				period
			};

			return super.createResponse(res, 200, "SUCCESS", responseData);
		} catch (error) {
			console.error('Traffic Data Error:', error);
			return super.createResponse(res, 500, error);
		}
	}

	// Get top pages
	async getTopPages(req, res) {
		try {
			const { period = '30days' } = req.query;
			const { startDate, endDate } = getDateRange(period);

			const topPages = await GoogleSearchConsoleService.getTopPages(startDate, endDate);

			return super.createResponse(res, 200, "SUCCESS", { topPages });
		} catch (error) {
			console.error('Top Pages Error:', error);
			return super.createResponse(res, 500, error);
		}
	}

	// Get top search queries
	async getTopQueries(req, res) {
		try {
			const { period = '30days' } = req.query;
			const { startDate, endDate } = getDateRange(period);

			const topQueries = await GoogleSearchConsoleService.getTopQueries(startDate, endDate);

			return super.createResponse(res, 200, "SUCCESS", { topQueries });
		} catch (error) {
			console.error('Top Queries Error:', error);
			return super.createResponse(res, 500, error);
		}
	}

	// Helper method to generate mock traffic data based on period
	generateTrafficData(period) {
		const data = [];
		const now = new Date();
		let days, interval;

		switch (period) {
			case '24hours':
				days = 1;
				interval = 60 * 60 * 1000; // 1 hour intervals
				for (let i = 23; i >= 0; i--) {
					const date = new Date(now.getTime() - (i * interval));
					data.push({
						date: date.toISOString(),
						views: Math.floor(Math.random() * 100) + 50,
						clicks: Math.floor(Math.random() * 60) + 20
					});
				}
				break;
			case '7days':
				days = 7;
				interval = 24 * 60 * 60 * 1000; // 1 day intervals
				for (let i = days - 1; i >= 0; i--) {
					const date = new Date(now.getTime() - (i * interval));
					data.push({
						date: date.toISOString(),
						views: Math.floor(Math.random() * 500) + 800,
						clicks: Math.floor(Math.random() * 300) + 400
					});
				}
				break;
			case '30days':
			default:
				days = 30;
				interval = 24 * 60 * 60 * 1000; // 1 day intervals
				for (let i = days - 1; i >= 0; i--) {
					const date = new Date(now.getTime() - (i * interval));
					data.push({
						date: date.toISOString(),
						views: Math.floor(Math.random() * 800) + 400,
						clicks: Math.floor(Math.random() * 400) + 200
					});
				}
				break;
			case '12months':
				days = 365;
				interval = 24 * 60 * 60 * 1000; // 1 day intervals, but we'll sample monthly
				for (let i = 11; i >= 0; i--) {
					const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
					data.push({
						date: date.toISOString(),
						views: Math.floor(Math.random() * 15000) + 5000,
						clicks: Math.floor(Math.random() * 8000) + 2000
					});
				}
				break;
		}

		return data;
	}
}

module.exports = new AnalyticsController();
