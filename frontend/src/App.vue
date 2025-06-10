<script setup>
import { onMounted, ref, watch } from "vue";
import Searchbar from "./components/Searchbar.vue";
import PodcastList from "./components/PodcastList.vue";
import { debounce } from "lodash";

const loadingPodcasts = ref(false);
const error = ref(null);
const podcasts = ref([]);
const searchTerm = ref("");
const hasSearched = ref(false);
const page = ref(1);
const limit = ref(12);
const totalPages = ref(1);
const totalItems = ref(0);

const SV_API_URL = import.meta.env.VITE_SV_API_URL;

onMounted(async () => {
    fetchPodcastData();
});

const onLimitChange = () => {
    page.value = 1;
    fetchPodcastData(searchTerm.value);
};

const fetchPodcastData = async (term = "") => {
    loadingPodcasts.value = true;
    error.value = null;

    try {
        const query = `
            query GetPodcasts($page: Int, $limit: Int, $search: String) {
                podcasts(page: $page, limit: $limit, search: $search) {
                    currentPage
                    totalPages
                    totalItems
                    podcasts {
                        id
                        title
                        description
                        categoryName
                        publisherName
                        isExclusive
                        hasFreeEpisodes
                        images {
                            default
                            thumbnail
                            featured
                            wide
                        }
                    }
                }
            }
        `;

        const variables = {
            page: page.value,
            limit: limit.value,
            search: term?.trim() || "",
        };

        const response = await fetch(`${SV_API_URL}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                const retryAfter = errorData.retryAfter || "a few minutes";
                throw new Error(
                    `Too many requests. Please wait ${retryAfter} and try again.`
                );
            } else if (response.status === 404) {
                throw new Error("Page not found. Please try again later.");
            } else if (response.status >= 500) {
                throw new Error("Server error. Please try again later.");
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const data = result.data.podcasts;
        podcasts.value = data.podcasts;
        totalPages.value = data.totalPages;
        totalItems.value = data.totalItems;
        page.value = data.currentPage;
    } catch (err) {
        console.error("Error fetching podcasts:", err);
        if (err.name === "TypeError" && err.message.includes("NetworkError")) {
            error.value =
                "we couldn't connect to the server. Please try again later.";
        } else {
            error.value = err.message || "an unexpected error occurred.";
        }
        podcasts.value = [];
        totalPages.value = 1;
        totalItems.value = 0;
    } finally {
        loadingPodcasts.value = false;
        hasSearched.value = true;
    }
};

const debouncedFetch = debounce((term) => {
    fetchPodcastData(term);
}, 500);

watch(searchTerm, (newTerm) => {
    page.value = 1;
    debouncedFetch(newTerm);
});

function onSearch(term) {
    searchTerm.value = term;
}

watch(page, (newPage) => {
    fetchPodcastData(searchTerm.value);
});
</script>

<template>
    <div class="app">
        <div class="container">
            <h1 class="main-title">Podcast Directory</h1>
            <div class="search-section">
                <Searchbar @search="onSearch" />
            </div>
            <div class="controls" v-if="hasSearched">
                <div class="results-info">
                    <span class="results-count">{{
                        totalItems.toLocaleString()
                    }}</span>
                    <span class="results-text">podcasts found</span>
                    <span v-if="searchTerm" class="search-term"
                        >for "{{ searchTerm }}"</span
                    >
                </div>
                <div class="controls-right">
                    <div class="limit-selector">
                        <label for="limit">Show:</label>
                        <select
                            id="limit"
                            v-model="limit"
                            @change="onLimitChange"
                            class="select-control"
                        >
                            <option :value="6">6</option>
                            <option :value="12">12</option>
                            <option :value="24">24</option>
                            <option :value="48">48</option>
                        </select>
                    </div>
                    <div class="page-info" v-if="totalPages > 1">
                        <span>Page {{ page }} of {{ totalPages }}</span>
                    </div>
                </div>
            </div>
            <PodcastList
                :podcasts="podcasts"
                :loading="loadingPodcasts"
                :error="error"
                :hasSearched="hasSearched"
                :page="page"
                :totalPages="totalPages"
                @page-change="(newPage) => (page = newPage)"
            />
        </div>
    </div>
</template>

<style scoped>
.app {
    min-height: 100vh;
    background-color: #f8f9fa;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        sans-serif;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.main-title {
    font-size: 2.5rem;
    font-weight: 600;
    color: #2d3748;
    text-align: center;
    margin-bottom: 2rem;
}

.search-section {
    margin-bottom: 2rem;
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-info {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.results-count {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
}

.results-text {
    color: #718096;
    font-weight: 500;
}

.search-term {
    color: #4a5568;
    font-weight: 600;
    font-style: italic;
}

.controls-right {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.limit-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.limit-selector label {
    font-weight: 500;
    color: #4a5568;
}

.select-control {
    color: #4a5568;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    background: white;
    font-weight: 500;
    cursor: pointer;
}

.select-control:focus {
    outline: none;
    border-color: #4a5568;
}

.page-info {
    color: #718096;
    font-weight: 500;
    padding: 0.5rem 1rem;
    background: #f7fafc;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }

    .main-title {
        font-size: 2rem;
    }

    .controls {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
        text-align: center;
    }

    .controls-right {
        justify-content: center;
        flex-wrap: wrap;
    }

    .results-info {
        justify-content: center;
    }
}
</style>
