<template>
  <div>
    <header class="header">
      <div class="header-inner">
        <button class="btn ghost" aria-label="Toggle sidebar" @click="toggleSidebar">
          <span style="font-size:18px">☰</span>
        </button>
        <div class="header-title">Weather Insight Dashboard</div>
        <HeaderBar
          :loading="weather.loading"
          @search="onSearch"
          @searching="onSearching"
        />
      </div>
    </header>

    <div class="layout">
      <aside v-show="sidebarOpen" class="sidebar" aria-label="Saved locations">
        <div class="sidebar-header">
          <strong>Locations</strong>
          <button class="btn" @click="addCurrentIfNotSaved" :disabled="!weather.currentLocation">
            + Add
          </button>
        </div>
        <SidebarLocations
          :locations="weather.savedLocations"
          :selected="weather.currentLocation"
          @select="weather.setLocation"
          @remove="weather.removeLocation"
          @clear="weather.clearLocations"
        />
      </aside>

      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';
import SidebarLocations from '@/components/SidebarLocations.vue';
import { useWeather } from '@/composables/useWeather';

const weather = useWeather();
const sidebarOpen = ref(true);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function onSearch(query: string) {
  weather.searchCity(query);
}

function onSearching(v: boolean) {
  // Reflect input focus/blur state to show/hide search results panel in pages
  weather.searching.value = v;
}

function addCurrentIfNotSaved() {
  if (weather.currentLocation.value) {
    weather.addLocation(weather.currentLocation.value);
  }
}

onMounted(() => {
  // Auto-initialize with a default location if none is present
  if (!weather.savedLocations.value.length) {
    weather.searchCity('San Francisco');
  }
});
</script>
