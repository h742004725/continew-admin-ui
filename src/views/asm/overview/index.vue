<template>
  <GiPageLayout>
    <a-space style="margin-bottom: 16px">
      <span style="font-weight: 600">国家/区域</span>
      <a-select v-model="countryCode" style="width: 160px" @change="fetchData">
        <a-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{ c.label }}</a-option>
      </a-select>
      <a-button :loading="loading" @click="fetchData">
        <template #icon><icon-refresh /></template>
        <template #default>刷新</template>
      </a-button>
    </a-space>

    <!-- KPI 卡片 -->
    <a-grid :cols="{ xs: 2, sm: 3, md: 6 }" :col-gap="12" :row-gap="12" style="margin-bottom: 16px">
      <a-grid-item v-for="kpi in kpiList" :key="kpi.label">
        <a-card :bordered="true" :body-style="{ padding: '16px' }">
          <a-statistic :title="kpi.label" :value="kpi.value" :value-style="kpi.danger ? { color: 'rgb(var(--red-6))' } : {}" show-group-separator />
        </a-card>
      </a-grid-item>
    </a-grid>

    <a-grid :cols="{ xs: 1, md: 2 }" :col-gap="16" :row-gap="16">
      <a-grid-item>
        <a-card title="开放端口 TOP10" :loading="loading">
          <BarList :data="stat?.topPorts" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="Web 中间件 TOP10" :loading="loading">
          <BarList :data="stat?.topServers" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="产品/服务 TOP10" :loading="loading">
          <BarList :data="stat?.topProducts" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="运营商 / ASN TOP10" :loading="loading">
          <BarList :data="stat?.topAsn" prefix="AS" />
        </a-card>
      </a-grid-item>
      <a-grid-item :span="{ xs: 1, md: 2 }">
        <a-card title="暴露面汇总" :loading="loading">
          <a-space wrap size="large">
            <a-statistic
              v-for="item in stat?.exposureSummary"
              :key="item.name"
              :title="item.name"
              :value="item.count"
              :value-style="{ color: item.count > 0 ? 'rgb(var(--red-6))' : 'rgb(var(--green-6))' }"
              show-group-separator
            />
            <a-empty v-if="!stat?.exposureSummary?.length" description="暂无数据" />
          </a-space>
        </a-card>
      </a-grid-item>
    </a-grid>
  </GiPageLayout>
</template>

<script setup lang="tsx">
import { computed, defineComponent, onMounted, ref } from 'vue'
import type { PropType } from 'vue'
import { getAssetOverview } from '@/apis/asm'
import type { AssetStatResp, NameCountResp } from '@/apis/asm'

defineOptions({ name: 'AsmOverview' })

const countryOptions = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]
const countryCode = ref('IN')
const loading = ref(false)
const stat = ref<AssetStatResp>()

const totalExposure = computed(() => (stat.value?.exposureSummary ?? []).reduce((sum, i) => sum + (i.count || 0), 0))

const kpiList = computed(() => [
  { label: 'IP 主机', value: stat.value?.hostCount ?? 0 },
  { label: '服务/端口', value: stat.value?.serviceCount ?? 0 },
  { label: 'Web 服务', value: stat.value?.httpCount ?? 0 },
  { label: 'SSL 服务', value: stat.value?.sslCount ?? 0 },
  { label: '域名', value: stat.value?.domainCount ?? 0 },
  { label: '高危暴露', value: totalExposure.value, danger: true },
])

// 分布条形组件（单一强调色 + 数值直标）
const BarList = defineComponent({
  props: {
    data: { type: Array as PropType<NameCountResp[]>, default: () => [] },
    prefix: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      const list = props.data || []
      if (!list.length) {
        return <a-empty description="暂无数据" />
      }
      const max = Math.max(...list.map((i) => i.count || 0), 1)
      return (
        <div class="bar-list">
          {list.map((i) => (
            <div class="bar-row" key={i.name}>
              <span class="bar-name" title={i.name}>{props.prefix}{i.name}</span>
              <div class="bar-track">
                <div class="bar-fill" style={{ width: `${((i.count || 0) / max) * 100}%` }} />
              </div>
              <span class="bar-value">{(i.count || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
  },
})

const fetchData = async () => {
  try {
    loading.value = true
    const res = await getAssetOverview(countryCode.value)
    stat.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.bar-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.bar-row {
  display: grid;
  grid-template-columns: 120px 1fr 72px;
  align-items: center;
  gap: 10px;
}
.bar-name {
  font-family: var(--font-family-mono, monospace);
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
  background: rgb(var(--arcoblue-6));
  border-radius: 4px;
  transition: width 0.3s;
}
.bar-value {
  font-family: var(--font-family-mono, monospace);
  font-size: 13px;
  text-align: right;
  color: var(--color-text-1);
}
</style>
