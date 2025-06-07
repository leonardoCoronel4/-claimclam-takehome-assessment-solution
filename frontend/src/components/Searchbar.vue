<template>
    <div class="search-container">
        <div class="search-wrapper">
            <input
                ref="searchInput"
                v-model="searchTerm"
                @input="handleInput"
                type="text"
                class="search-input"
                placeholder="Search podcasts by title, category, or publisher..."
                autocomplete="off"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['search'])
const searchInput = ref(null)
const searchTerm = ref('')

onMounted(() => {
    searchInput.value?.focus()
})

const handleInput = () => {
    emit('search', searchTerm.value)
}
</script>

<style scoped>
.search-container {
    max-width: 600px;
    margin: 0 auto;
}

.search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.search-wrapper:hover {
    border-color: #cbd5e0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-wrapper:focus-within {
    border-color: #4a5568;
    box-shadow: 0 0 0 3px rgba(74, 85, 104, 0.1);
}

.search-input {
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    background: transparent;
    font-size: 1rem;
    font-weight: 500;
    color: #2d3748;
    outline: none;
}

.search-input::placeholder {
    color: #a0aec0;
    font-weight: 400;
}

@media (max-width: 768px) {
    .search-input {
        padding: 0.875rem 1rem;
        font-size: 0.95rem;
    }
}
</style>