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
          <BarList :data="stat?.topAsn" />
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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BarList from './BarList.vue'
import { getAssetOverview } from '@/apis/asm'
import type { AssetStatResp } from '@/apis/asm'

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
