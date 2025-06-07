const axios = require("axios");
require("dotenv").config();

const BASE_URL = process.env.PODCAST_API_URL;

async function fetchAllPodcasts({ page = 1, limit = 10, search = "" } = {}) {
    try {
        const params = { page, limit };
        if (search && search.trim() !== "") {
            params.search = search;
        }
        const response = await axios.get(`${BASE_URL}/podcasts`, { params });
        return response.data;
    } catch (error) {
        throw new Error("Error fetching all podcast data");
    }
}

async function fetchTotalCount(search = "") {
    try {
        const params = { limit: 10000 };
        if (search && search.trim() !== "") {
            params.search = search;
        }
        const response = await axios.get(`${BASE_URL}/podcasts`, { params });
        return response.data.length;
    } catch (error) {
        throw new Error("Error counting total podcast items");
    }
}


async function fetchPodcastData(queryParams = {}) {
    try {
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const search = queryParams.search?.toLowerCase() || "";
        const [pagedResults, totalCount] = await Promise.all([
            fetchAllPodcasts({ page, limit, search }),
            fetchTotalCount(search),
        ])
        const totalPages = Math.ceil(totalCount / limit);
        return {
            podcasts: pagedResults,
            currentPage: page,
            totalPages: totalPages,
        };
    } catch (error) {
        throw new Error("Error filtering podcast data");
    }
}

module.exports = {
    fetchPodcastData,
    fetchAllPodcasts,
};
