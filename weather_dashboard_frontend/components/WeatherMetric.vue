<template>
  <div class="kpi">
    <div class="kpi-label">{{ title }}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
      <div style="font-size:18px;">{{ icon }}</div>
      <div class="kpi-value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
  icon?: string;
}>();
</script>
