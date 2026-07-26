<template>
  <a-empty v-if="!data || !data.length" description="暂无数据" />
  <div v-else class="bar-list">
    <div v-for="item in data" :key="item.name" class="bar-row">
      <span class="bar-name" :title="item.name">{{ prefix }}{{ item.name }}</span>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: percent(item.count) }" />
      </div>
      <span class="bar-value">{{ (item.count || 0).toLocaleString() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NameCountResp } from '@/apis/asm'

const props = withDefaults(defineProps<{ data?: NameCountResp[], prefix?: string }>(), {
  data: () => [],
  prefix: '',
})

const max = computed(() => Math.max(...(props.data || []).map((i) => i.count || 0), 1))
const percent = (count?: number) => `${((count || 0) / max.value) * 100}%`
</script>

<style scoped lang="scss">
.bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bar-row {
  display: grid;
  grid-template-columns: 130px 1fr 72px;
  align-items: center;
  gap: 10px;
}
.bar-name {
  font-size: 13px;
  color: var(--color-text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bar-track {
  height: 16px;
  background: var(--color-fill-2);
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  min-width: 2px;
  background: rgb(var(--arcoblue-6));
  border-radius: 4px;
  transition: width 0.3s;
}
.bar-value {
  font-size: 13px;
  text-align: right;
  color: var(--color-text-1);
  font-variant-numeric: tabular-nums;
}
</style>
