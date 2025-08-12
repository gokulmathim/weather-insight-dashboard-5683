<template>
  <div>
    <ul class="sidebar-list">
      <li
        v-for="loc in locations"
        :key="`${loc.name}-${loc.lat}-${loc.lon}`"
        class="sidebar-item"
        :class="{ active: isSelected(loc) }"
        @click="$emit('select', loc)"
      >
        <div>
          <div><strong>{{ loc.name }}</strong> <span class="muted" v-if="loc.country">({{ loc.country }})</span></div>
          <div class="muted" style="font-size:12px;">{{ loc.lat.toFixed(2) }}, {{ loc.lon.toFixed(2) }}</div>
        </div>
        <button class="btn ghost" @click.stop="$emit('remove', loc)" aria-label="Remove location">✕</button>
      </li>
    </ul>

    <div style="padding:8px;border-top:1px solid rgba(2,6,23,0.06);display:flex;justify-content:space-between;gap:8px;">
      <button class="btn ghost" @click="$emit('clear')">Clear</button>
      <span class="badge" title="Tip">Tip: Use the search bar above to find cities</span>
    </div>
  </div>
</template>

<script setup lang="ts">
export type Location = { name: string; country?: string; lat: number; lon: number; state?: string };

const props = defineProps<{
  locations: Location[];
  selected?: Location | null;
}>();

const emit = defineEmits<{
  (e: 'select', loc: Location): void;
  (e: 'remove', loc: Location): void;
  (e: 'clear'): void;
}>();

function isSelected(loc: Location) {
  const s = props.selected;
  if (!s) return false;
  return s.name === loc.name && Math.abs(s.lat - loc.lat) < 0.0001 && Math.abs(s.lon - loc.lon) < 0.0001;
}
</script>
