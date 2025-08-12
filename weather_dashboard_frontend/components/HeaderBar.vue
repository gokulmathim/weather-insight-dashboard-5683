<template>
  <form class="header-search" @submit.prevent="onSubmit">
    <span aria-hidden="true" style="font-size:16px;margin-right:8px;">🔎</span>
    <input v-model="query" type="search" placeholder="Search city (e.g., London, Tokyo, San Francisco)" @focus="emitSearching(true)" @blur="emitSearching(false)" />
    <button class="btn" type="submit" :disabled="!query || loading">
      <span v-if="!loading">Search</span>
      <span v-else>Searching…</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits<{
  (e: 'search', q: string): void;
  (e: 'searching', v: boolean): void;
}>();

const props = defineProps<{
  loading?: boolean;
}>();

const query = ref('');

function onSubmit() {
  if (!query.value) return;
  emit('search', query.value);
}

function emitSearching(v: boolean) {
  emit('searching', v);
}

// Emit while typing with debounce-lite
let to: any;
watch(query, (v) => {
  clearTimeout(to);
  to = setTimeout(() => {
    if (v && v.length >= 2) emit('search', v);
  }, 300);
});
</script>
