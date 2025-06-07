<template>
    <div class="podcast-list-container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <div class="loader">
                <div class="spinner"></div>
                <p>Loading podcasts...</p>
            </div>
        </div>
        <div v-else-if="error" class="error-container">
            <div class="error-card">
                <h3 class="error-title">Something went wrong</h3>
                <p class="error-message">{{ error }}</p>
            </div>
        </div>
        <div
            v-else-if="hasSearched && podcasts.length === 0"
            class="empty-container"
        >
            <div class="empty-card">
                <h3 class="empty-title">No podcasts found</h3>
                <p class="empty-message">
                    Try adjusting your search terms or browse our categories
                </p>
            </div>
        </div>
        <div v-else-if="podcasts.length > 0" class="podcasts-grid">
            <div
                v-for="podcast in podcasts"
                :key="podcast.id"
                class="podcast-card"
            >
                <div class="podcast-image-container">
                        <img
                            :src="
                                podcast.images?.thumbnail ||
                                podcast.images?.default
                            "
                            :alt="podcast.title"
                            class="podcast-image"
                            loading="lazy"
                        />
                    <div class="podcast-badges">
                        <span v-if="podcast.isExclusive" class="badge exclusive"
                            >Exclusive</span
                        >
                        <span v-if="podcast.hasFreeEpisodes" class="badge free"
                            >Free</span
                        >
                    </div>
                </div>

                <div class="podcast-content">
                    <h3 class="podcast-title">{{ podcast.title }}</h3>
                    <p class="podcast-publisher">{{ podcast.publisherName }}</p>
                    <p class="podcast-category">{{ podcast.categoryName }}</p>
                    <p class="podcast-description">
                        {{ truncateDescription(podcast.description) }}
                    </p>
                </div>
            </div>
        </div>
        <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination">
                <button
                    @click="changePage(page - 1)"
                    :disabled="page <= 1"
                    class="pagination-btn"
                    :class="{ disabled: page <= 1 }"
                >
                    Previous
                </button>
                <div class="pagination-numbers">
                    <button
                        v-for="pageNum in visiblePages"
                        :key="pageNum"
                        @click="changePage(pageNum)"
                        class="pagination-number"
                        :class="{ active: pageNum === page }"
                    >
                        {{ pageNum }}
                    </button>
                </div>
                <button
                    @click="changePage(page + 1)"
                    :disabled="page >= totalPages"
                    class="pagination-btn"
                    :class="{ disabled: page >= totalPages }"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
    podcasts: Array,
    loading: Boolean,
    error: String,
    hasSearched: Boolean,
    page: Number,
    totalPages: Number,
});

const emit = defineEmits(["page-change", "retry"]);

const visiblePages = computed(() => {
    const current = props.page;
    const total = props.totalPages;
    const range = 2;

    let start = Math.max(1, current - range);
    let end = Math.min(total, current + range);

    if (end - start < range * 2) {
        if (start === 1) {
            end = Math.min(total, start + range * 2);
        } else if (end === total) {
            start = Math.max(1, end - range * 2);
        }
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
});

const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= props.totalPages) {
        emit("page-change", newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
};

const truncateDescription = (description) => {
    if (!description) return "";
    return description.length > 150
        ? description.substring(0, 150) + "..."
        : description;
};
</script>

<style scoped>
.podcast-list-container {
    min-height: 400px;
}

/* Loading State */
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 2rem;
}

.loader {
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #4a5568;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loader p {
    color: #718096;
    font-weight: 500;
}

/* Error State */
.error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 2rem;
}

.error-card {
    text-align: center;
    padding: 2rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 400px;
}

.error-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
}

.error-message {
    color: #718096;
    margin-bottom: 1.5rem;
    line-height: 1.5;
}

.retry-button {
    padding: 0.75rem 1.5rem;
    background: #4a5568;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
}

.retry-button:hover {
    background: #2d3748;
}

/* Empty State */
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 2rem;
}

.empty-card {
    text-align: center;
    padding: 2rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    max-width: 400px;
}

.empty-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 1rem;
}

.empty-message {
    color: #718096;
    line-height: 1.5;
}

/* Podcast Grid */
.podcasts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 2rem 0;
}

.podcast-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
}

.podcast-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.podcast-image-container {
    color: black;
    position: relative;
    width: 100%;
    height: 180px;
    overflow: hidden;
}

.podcast-image {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.podcast-badges {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 0.5rem;
}

.badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.badge.exclusive {
    background: #e53e3e;
    color: white;
}

.badge.free {
    background: #38a169;
    color: white;
}

.podcast-content {
    padding: 1rem;
}

.podcast-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.podcast-publisher {
    color: #4a5568;
    font-weight: 500;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
}

.podcast-category {
    color: #718096;
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.podcast-description {
    color: #718096;
    font-size: 0.875rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Pagination */
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    padding: 2rem 0;
}

.pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #e2e8f0;
    background: white;
    color: #4a5568;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-btn:hover:not(.disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
}

.pagination-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-numbers {
    display: flex;
    gap: 0.25rem;
    margin: 0 1rem;
}

.pagination-number {
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #4a5568;
    font-weight: 500;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-number:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
}

.pagination-number.active {
    background: #4a5568;
    color: white;
    border-color: #4a5568;
}

@media (max-width: 768px) {
    .podcasts-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        padding: 1rem 0;
    }

    .pagination {
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .pagination-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
    }

    .pagination-numbers {
        margin: 0 0.5rem;
    }

    .pagination-number {
        width: 32px;
        height: 32px;
        font-size: 0.875rem;
    }
}

@media (max-width: 480px) {
    .podcasts-grid {
        grid-template-columns: 1fr;
    }
}
</style>
