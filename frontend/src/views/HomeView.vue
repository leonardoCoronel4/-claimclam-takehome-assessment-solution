<template>
    <div>
        <search-bar v-model="search" @submit="handleSearch" />
        <div v-if="loading">Cargando podcasts...</div>
        <div v-else-if="error">{{ error }}</div>
        <div v-else-if="podcasts.length === 0">No se encontraron podcasts"</div>
        <PodcastList v-else :podcasts="podcasts" />
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { fetchPodcastData } from '../api/podcasts';
    import PodcastList from '../components/PodcastList.vue';
    import SearchBar from '../components/SearchBar.vue';

    const search = ref('');
    const loading = ref(false);
    const error = ref(null);
    const podcasts = ref([]);

    const handleSearch = async () => {
        loading.value = true;
        error.value = null;
        try {
            const data = await fetchPodcastData({ search: search.value });
            podcasts.value = data;
        } catch (err) {
            error.value = err.message;
        } finally {
            loading.value = false;
        }
    }
</script>

<style lang="scss" scoped>

</style>