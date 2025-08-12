<template>
  <div style="display:grid;gap:8px;">
    <div
      v-for="d in items"
      :key="d.date"
      style="display:grid;grid-template-columns: 1fr auto auto;align-items:center;padding:10px 12px;border-radius:12px;border:1px solid rgba(2,6,23,0.06);"
    >
      <div class="muted">{{ new Date(d.date).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }) }}</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <img v-if="d.iconUrl" :src="d.iconUrl" alt="" width="36" height="36" />
      </div>
      <div style="font-weight:700;">{{ Math.round(d.minC) }}° / {{ Math.round(d.maxC) }}°</div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Daily { date: string; minC: number; maxC: number; icon?: string; iconUrl?: string }
const props = defineProps<{ items: Daily[] }>();
</script>
