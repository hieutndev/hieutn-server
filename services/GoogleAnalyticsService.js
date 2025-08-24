const { BetaAnalyticsDataClient } = require('@google-analytics/data');

class GoogleAnalyticsService {
    constructor() {
        try {
            // Initialize the Analytics Data API client
            this.analyticsDataClient = new BetaAnalyticsDataClient({
                keyFilename: process.env.GOOGLE_ANALYTICS_KEY_FILE, // Path to service account JSON
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            });

            this.propertyId = process.env.GA4_PROPERTY_ID; // Your GA4 Property ID

            if (!this.propertyId) {
                console.warn('GA4_PROPERTY_ID environment variable not set. Using mock data.');
                this.useMockData = true;
            } else {
                console.warn('GA4_PROPERTY_ID environment variable set. Using real data.');
                this.useMockData = false;
            }
        } catch (error) {
            console.warn('Failed to initialize Google Analytics client. Using mock data.', error.message);
            this.useMockData = true;
        }
    }

    async getSiteMetrics(startDate, endDate) {
        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [
                    {
                        startDate: startDate,
                        endDate: endDate,
                    },
                ],
                dimensions: [
                    {
                        name: 'pagePath',
                    },
                ],
                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'engagedSessions',
                    },
                    {
                        name: 'userEngagementDuration',
                    },
                ],
                orderBys: [
                    {
                        metric: {
                            metricName: 'screenPageViews',
                        },
                        desc: true,
                    },
                ],
                limit: 10,
            });

            return response.rows?.map(row => ({
                page: row.dimensionValues[0].value,
                views: parseInt(row.metricValues[0].value) || 0,
                clicks: parseInt(row.metricValues[1].value) || 0,
                engagementTime: parseInt(row.metricValues[2].value) || 0
            })) || [];
        } catch (error) {
            console.error('Error fetching GA4 top pages:', error);
            return this.getMockTopPages();
        }
    }

    async getUserMetrics(startDate, endDate) {

        try {
            const [response] = await this.analyticsDataClient.runReport({
                property: `properties/${this.propertyId}`,
                dateRanges: [
                    {
                        startDate: startDate,
                        endDate: endDate,
                    },
                ],
                metrics: [
                    {
                        name: 'totalUsers',
                    },
                    {
                        name: 'newUsers',
                    },
                    {
                        name: 'sessions',
                    }
                ],
            });

            const metrics = response.rows[0].metricValues;

            return {
                totalVisitors: parseInt(metrics[0].value) || 0,
                newVisitors: parseInt(metrics[1].value) || 0,
                totalSessions: parseInt(metrics[2].value) || 0,
            };
        } catch (error) {
            console.error('Error fetching GA4 user metrics:', error);
            return {}
        }
    }

}

module.exports = new GoogleAnalyticsService();
