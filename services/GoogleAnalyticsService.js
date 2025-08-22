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

    async getTrafficData(startDate, endDate) {
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
                        name: 'date',
                    },
                ],
                metrics: [
                    {
                        name: 'screenPageViews',
                    },
                    {
                        name: 'userEngagementDuration',
                    },
                    {
                        name: 'engagedSessions',
                    },
                ],
            });
            return response.rows?.map(row => ({
                date: row.dimensionValues[0].value,
                views: parseInt(row.metricValues[0].value) || 0,
                clicks: parseInt(row.metricValues[2].value) || 0, // Using engaged sessions as proxy for clicks
                engagementTime: parseInt(row.metricValues[1].value) || 0
            })) || [];
        } catch (error) {
            console.error('Error fetching GA4 traffic data:', error);
            // Fallback to mock data on error
            return this.getMockTrafficData(startDate, endDate);
        }
    }

    async getTopPages(startDate, endDate) {
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
                    },
                    {
                        name: 'bounceRate',
                    },
                    {
                        name: 'averageSessionDuration',
                    },
                    {
                        name: 'screenPageViews',
                    },
                ],
            });

            if (!response.rows || response.rows.length === 0) {
                return this.getMockUserMetrics();
            }

            const metrics = response.rows[0].metricValues;
            return {
                totalUsers: parseInt(metrics[0].value) || 0,
                newUsers: parseInt(metrics[1].value) || 0,
                sessions: parseInt(metrics[2].value) || 0,
                bounceRate: parseFloat(metrics[3].value) || 0,
                averageSessionDuration: parseFloat(metrics[4].value) || 0,
                totalViews: parseInt(metrics[5].value) || 0
            };
        } catch (error) {
            console.error('Error fetching GA4 user metrics:', error);
            return {}
        }
    }

    // Mock data methods for fallback
    getMockTrafficData(startDate, endDate) {
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i < diffDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                views: Math.floor(Math.random() * 500) + 200,
                clicks: Math.floor(Math.random() * 200) + 50,
                engagementTime: Math.floor(Math.random() * 300) + 60
            });
        }

        return data;
    }

    getMockTopPages() {
        return [
            { page: '/projects', views: 5200, clicks: 3100 },
            { page: '/about', views: 4800, clicks: 2900 },
            { page: '/contact', views: 3200, clicks: 1800 },
            { page: '/blog', views: 2100, clicks: 1200 },
            { page: '/resume', views: 1800, clicks: 980 }
        ];
    }

    getMockUserMetrics() {
        return {
            totalUsers: 15420,
            newUsers: 8750,
            sessions: 21500,
            bounceRate: 0.42,
            averageSessionDuration: 180.5,
            totalViews: 21500
        };
    }

    
}

module.exports = new GoogleAnalyticsService();
