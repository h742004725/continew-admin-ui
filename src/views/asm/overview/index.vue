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
        <a-card :bordered="true" :body-style="{ padding: '16px' }" :hoverable="kpi.danger" :style="kpi.danger ? { cursor: 'pointer' } : {}" @click="kpi.danger && goExposed()">
          <a-statistic :title="kpi.label" :value="kpi.value" :value-style="kpi.danger ? { color: 'rgb(var(--red-6))' } : {}" show-group-separator />
        </a-card>
      </a-grid-item>
    </a-grid>

    <!-- 暴露面汇总前置：首屏可见，符合「先看风险」的设计 -->
    <a-card :loading="loading" style="margin-bottom: 16px">
      <template #title>暴露面汇总</template>
      <template #extra>
        <a-link @click="goExposed()">查看暴露资产 <icon-right /></a-link>
      </template>
      <a-space wrap size="large">
        <div v-for="item in stat?.exposureSummary" :key="item.name" class="exposure-item" @click="goExposed(item.code)">
          <a-statistic
            :title="item.name"
            :value="item.count"
            :value-style="{ color: item.count > 0 ? 'rgb(var(--red-6))' : 'rgb(var(--green-6))' }"
            show-group-separator
          />
        </div>
        <a-empty v-if="!stat?.exposureSummary?.length" description="暂无数据" />
      </a-space>
    </a-card>

    <a-grid :cols="{ xs: 1, md: 2 }" :col-gap="16" :row-gap="16">
      <a-grid-item>
        <a-card title="开放端口 TOP10" :loading="loading">
          <BarList :data="stat?.topPorts" clickable @item-click="(i) => goService({ port: i.name })" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="Web 中间件 TOP10" :loading="loading">
          <BarList :data="stat?.topServers" clickable @item-click="(i) => goWeb({ httpServer: i.name })" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="产品/服务 TOP10" :loading="loading">
          <BarList :data="stat?.topProducts" clickable @item-click="(i) => goService({ product: i.name })" />
        </a-card>
      </a-grid-item>
      <a-grid-item>
        <a-card title="运营商 / ASN TOP10" :loading="loading">
          <BarList :data="stat?.topAsn" clickable @item-click="(i) => goHost({ asn: i.name })" />
        </a-card>
      </a-grid-item>
    </a-grid>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BarList from './BarList.vue'
import { getAssetOverview } from '@/apis/asm'
import type { AssetStatResp } from '@/apis/asm'

defineOptions({ name: 'AsmOverview' })

const router = useRouter()
// 画像 → 查询联动：跳转资产列表并按暴露类别下钻（不传类别则查看全部暴露）
const goExposed = (exposureType?: string) => {
  // 证书过期属于证书维度，下钻到证书 Tab；其余端口类下钻到服务 Tab
  if (exposureType === 'EXPIRED_CERT') {
    router.push({ path: '/asm/asset', query: { tab: 'cert', expired: '1', countryCode: countryCode.value } })
    return
  }
  router.push({
    path: '/asm/asset',
    query: { tab: 'service', exposed: '1', exposureType: exposureType || 'ALL', countryCode: countryCode.value },
  })
}

// 分布下钻：端口/中间件/产品 → 服务列表；ASN → 主机列表
const goService = (q: Record<string, string>) => router.push({
  path: '/asm/asset',
  query: { tab: 'service', countryCode: countryCode.value, ...q },
})
const goHost = (q: Record<string, string>) => router.push({
  path: '/asm/asset',
  query: { tab: 'host', countryCode: countryCode.value, ...q },
})
const goWeb = (q: Record<string, string>) => router.push({
  path: '/asm/asset',
  query: { tab: 'web', countryCode: countryCode.value, ...q },
})

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

<style scoped lang="scss">
.exposure-item {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.exposure-item:hover {
  background: var(--color-fill-2);
}
</style>
