// API service for making requests to the backend
const API_BASE_URL = `${process.env.REACT_APP_SERVER_URL}/api}` || 'http://localhost:8000/api';

class ApiService {
    // Get today's date in YYYYMMDD format
    static getTodayDate() {
        return new Date().toISOString().split('T')[0].replace(/-/g, '');
    }

    // Format date from YYYY-MM-DD to YYYYMMDD
    static formatDateForAPI(dateString) {
        return dateString.replace(/-/g, '');
    }

    // Generic fetch with error handling
    static async fetchWithErrorHandling(url, options = {}) {
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If we can't parse error JSON, use the default message
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error(`API call failed for ${url}:`, error.message);
            throw error;
        }
    }

    // Fetch combined summary and articles for a specific date
    static async getCombinedDataByDate(date) {
        const formattedDate = this.formatDateForAPI(date);
        const url = `${API_BASE_URL}/articles/combined/${formattedDate}`;
        return await this.fetchWithErrorHandling(url);
    }

    // Fetch only summary for a specific date
    static async getSummaryByDate(date) {
        const formattedDate = this.formatDateForAPI(date);
        const url = `${API_BASE_URL}/summaries/${formattedDate}`;
        return await this.fetchWithErrorHandling(url);
    }

    // Fetch only articles for a specific date
    static async getArticlesByDate(date) {
        const formattedDate = this.formatDateForAPI(date);
        const url = `${API_BASE_URL}/articles/${formattedDate}`;
        return await this.fetchWithErrorHandling(url);
    }

    // Fetch article by ID
    static async getArticleById(id) {
        const url = `${API_BASE_URL}/articles/id/${id}`;
        return await this.fetchWithErrorHandling(url);
    }

    // Get all available summaries (for date selection)
    static async getAllSummaries() {
        const url = `${API_BASE_URL}/summaries`;
        return await this.fetchWithErrorHandling(url);
    }

    // Test API connection
    static async testConnection() {
        try {
            const url = `${API_BASE_URL}/summaries/20250923`;
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('API connection test failed:', error.message);
            return false;
        }
    }
}

export default ApiService;
