
const { google } = require('googleapis');

class GoogleSearchConsoleService {
    constructor() {
        try {
            // Initialize the Search Console API client
            this.auth = new google.auth.GoogleAuth({
                keyFile: process.env.GOOGLE_SEARCH_CONSOLE_KEY_FILE,
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
            });

            this.searchconsole = google.searchconsole({ version: 'v1', auth: this.auth });
            this.siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;

            if (!this.siteUrl) {
                console.warn('SEARCH_CONSOLE_SITE_URL environment variable not set. Using mock data.');
                this.useMockData = true;
            } else {
                this.useMockData = false;
            }
        } catch (error) {
            console.warn('Failed to initialize Google Search Console client. Using mock data.', error.message);
            this.useMockData = true;
        }
    }

    async getSearchAnalytics(startDate, endDate, dimensions = ['date']) {
        if (this.useMockData) {
            return this.getMockSearchAnalytics(startDate, endDate, dimensions);
        }

        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: startDate,
                    endDate: endDate,
                    dimensions: dimensions,
                    rowLimit: 25000,
                },
            });

            return response.data.rows || [];
        } catch (error) {
            console.error('Error fetching Search Console data:', error);
            return this.getMockSearchAnalytics(startDate, endDate, dimensions);
        }
    }

    async getTopQueries(startDate, endDate) {
        if (this.useMockData) {
            return this.getMockTopQueries();
        }

        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: startDate,
                    endDate: endDate,
                    dimensions: ['query'],
                    rowLimit: 50,
                },
            });

            return response.data.rows?.map(row => ({
                query: row.keys[0],
                impressions: row.impressions || 0,
                clicks: row.clicks || 0,
                ctr: ((row.ctr || 0) * 100).toFixed(2), // Convert to percentage
                position: (row.position || 0).toFixed(1)
            })) || [];
        } catch (error) {
            console.error('Error fetching top queries:', error);
            return this.getMockTopQueries();
        }
    }

    async getTopPages(startDate, endDate) {


        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: startDate,
                    endDate: endDate,
                    dimensions: ['page'],
                    rowLimit: 50,
                },
            });

            return response.data.rows?.map(row => ({
                page: row.keys[0].replace(this.siteUrl, ''), // Remove domain to get path
                impressions: row.impressions || 0,
                clicks: row.clicks || 0,
                ctr: ((row.ctr || 0) * 100).toFixed(2),
                position: (row.position || 0).toFixed(1)
            })) || [];
        } catch (error) {
            console.error('Error fetching top pages:', error);
            return this.getMockTopPages();
        }
    }

    async getSearchPerformanceByDate(startDate, endDate) {
        if (this.useMockData) {
            return this.getMockSearchPerformanceByDate(startDate, endDate);
        }

        try {
            const response = await this.searchconsole.searchanalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: startDate,
                    endDate: endDate,
                    dimensions: ['date'],
                    rowLimit: 500,
                },
            });

            return response.data.rows?.map(row => ({
                date: row.keys[0],
                impressions: row.impressions || 0,
                clicks: row.clicks || 0,
                ctr: ((row.ctr || 0) * 100).toFixed(2),
                position: (row.position || 0).toFixed(1)
            })) || [];
        } catch (error) {
            console.error('Error fetching search performance by date:', error);
            return this.getMockSearchPerformanceByDate(startDate, endDate);
        }
    }

    // Mock data methods for fallback
    getMockTopQueries() {
        return [
            { query: 'web developer portfolio', impressions: 1200, clicks: 320, ctr: 26.7, position: 3.2 },
            { query: 'react developer', impressions: 980, clicks: 245, ctr: 25.0, position: 4.1 },
            { query: 'frontend developer', impressions: 850, clicks: 190, ctr: 22.4, position: 5.3 },
            { query: 'javascript developer', impressions: 720, clicks: 150, ctr: 20.8, position: 6.2 },
            { query: 'node.js developer', impressions: 620, clicks: 120, ctr: 19.4, position: 7.1 },
            { query: 'full stack developer', impressions: 580, clicks: 110, ctr: 19.0, position: 6.8 },
            { query: 'portfolio website', impressions: 450, clicks: 85, ctr: 18.9, position: 8.3 },
            { query: 'web development services', impressions: 380, clicks: 65, ctr: 17.1, position: 9.1 }
        ];
    }

    getMockTopPages() {
        return [
            { page: '/projects', impressions: 3200, clicks: 850, ctr: 26.6, position: 4.2 },
            { page: '/about', impressions: 2800, clicks: 720, ctr: 25.7, position: 4.8 },
            { page: '/contact', impressions: 1900, clicks: 420, ctr: 22.1, position: 5.9 },
            { page: '/blog', impressions: 1200, clicks: 240, ctr: 20.0, position: 6.5 },
            { page: '/resume', impressions: 980, clicks: 180, ctr: 18.4, position: 7.2 },
            { page: '/', impressions: 1500, clicks: 350, ctr: 23.3, position: 5.1 }
        ];
    }

    getMockSearchPerformanceByDate(startDate, endDate) {
        const data = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i < diffDays; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);

            const baseImpressions = Math.floor(Math.random() * 200) + 100;
            const clicks = Math.floor(baseImpressions * (Math.random() * 0.15 + 0.1)); // 10-25% CTR

            data.push({
                date: date.toISOString().split('T')[0],
                impressions: baseImpressions,
                clicks: clicks,
                ctr: ((clicks / baseImpressions) * 100).toFixed(2),
                position: (Math.random() * 3 + 4).toFixed(1) // Position between 4-7
            });
        }

        return data;
    }

    getMockSearchAnalytics(startDate, endDate, dimensions = ['date']) {
        if (dimensions.includes('query')) {
            return this.getMockTopQueries();
        }
        if (dimensions.includes('page')) {
            return this.getMockTopPages();
        }
        return this.getMockSearchPerformanceByDate(startDate, endDate);
    }
}

module.exports = new GoogleSearchConsoleService();
