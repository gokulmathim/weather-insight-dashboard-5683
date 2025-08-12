<template>
  <div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <div class="muted">View</div>
      <div style="display:flex;gap:8px;">
        <button class="btn ghost" :class="{ active: mode === 'hourly' }" @click="switchMode('hourly')">Hourly</button>
        <button class="btn ghost" :class="{ active: mode === 'daily' }" @click="switchMode('daily')">Weekly</button>
      </div>
    </div>
    <div>
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        style="max-height: 320px;"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart, LineElement, PointElement, LinearScale, Title, Tooltip, Filler, CategoryScale,
} from 'chart.js';
Chart.register(LineElement, PointElement, LinearScale, Title, Tooltip, Filler, CategoryScale);

export interface Hourly { time: string; tempC: number }
export interface Daily { date: string; minC: number; maxC: number }

const props = defineProps<{
  hourly: Hourly[];
  daily: Daily[];
  mode?: 'hourly' | 'daily';
}>();

const emit = defineEmits<{ (e: 'changeMode', m: 'hourly' | 'daily'): void }>();

const mode = ref<'hourly' | 'daily'>(props.mode || 'hourly');
watch(() => props.mode, v => { if (v) mode.value = v; });

function switchMode(m: 'hourly' | 'daily') {
  mode.value = m;
  emit('changeMode', m);
}

const chartData = computed(() => {
  if (mode.value === 'hourly') {
    return {
      labels: props.hourly?.map(h => new Date(h.time).toLocaleTimeString([], { hour: '2-digit' })),
      datasets: [{
        label: 'Temp (°C)',
        data: props.hourly?.map(h => h.tempC),
        tension: 0.35,
        fill: true,
        backgroundColor: 'rgba(33, 134, 235, 0.15)',
        borderColor: 'rgba(33, 134, 235, 1)',
        pointRadius: 2,
      }],
    };
  }
  // daily
  return {
    labels: props.daily?.map(d => new Date(d.date).toLocaleDateString([], { weekday: 'short' })),
    datasets: [
      {
        label: 'Max (°C)',
        data: props.daily?.map(d => d.maxC),
        borderColor: 'rgba(33, 134, 235, 1)',
        backgroundColor: 'rgba(33, 134, 235, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
      {
        label: 'Min (°C)',
        data: props.daily?.map(d => d.minC),
        borderColor: 'rgba(72, 72, 72, 1)',
        backgroundColor: 'rgba(72, 72, 72, 0.1)',
        fill: true,
        tension: 0.35,
        pointRadius: 2,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: false },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  interaction: { mode: 'nearest' as const, intersect: false },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: false,
      grid: { color: 'rgba(0, 0, 0, 0.06)' },
      ticks: { callback: (val: number) => `${val}°` },
    },
  },
};
</script>

<style scoped>
.btn.ghost.active {
  background: rgba(33, 134, 235, 0.12);
  border: 1px solid rgba(33, 134, 235, 0.2);
}
</style>
