<template>
  <GiTable
    row-key="serviceId"
    :data="dataList"
    :columns="columns"
    :loading="loading"
    :scroll="{ x: '100%', y: '100%', minWidth: 1100 }"
    :pagination="pagination"
    :disabled-tools="['size']"
    @refresh="search"
  >
    <template #toolbar-left>
      <a-select v-model="queryForm.countryCode" style="width: 120px" @change="search">
        <a-option v-for="c in COUNTRY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</a-option>
      </a-select>
      <a-input v-model="queryForm.httpTitle" placeholder="标题" allow-clear style="width: 170px" @change="search" />
      <a-input v-model="queryForm.httpServer" placeholder="中间件" allow-clear style="width: 140px" @change="search" />
      <a-input-number v-model="queryForm.httpStatus" placeholder="状态码" allow-clear style="width: 110px" @change="search" />
      <a-input v-model="queryForm.ipStr" placeholder="IP/网段" allow-clear style="width: 140px" @change="search" />
      <a-tooltip content="仅看 HTTPS 站点">
        <a-switch v-model="queryForm.httpsOnly" @change="search">
          <template #checked>HTTPS</template>
          <template #unchecked>HTTPS</template>
        </a-switch>
      </a-tooltip>
      <a-button type="primary" @click="search"><template #icon><icon-search /></template>查询</a-button>
      <a-button @click="reset">重置</a-button>
    </template>
  </GiTable>
</template>

<script setup lang="tsx">
import { reactive } from 'vue'
import { useRoute } from 'vue-router'
import type { TableColumnData } from '@arco-design/web-vue'
import { listAssetWeb, type AssetWebQuery } from '@/apis/asm'
import { useTable } from '@/hooks'

const COUNTRY_OPTIONS = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]

// 状态码配色：2xx 绿 / 3xx 蓝 / 4xx 橙 / 5xx 红
const statusColor = (code?: number) => {
  if (!code) {
    return 'gray'
  }
  if (code < 300) {
    return 'green'
  }
  if (code < 400) {
    return 'arcoblue'
  }
  if (code < 500) {
    return 'orange'
  }
  return 'red'
}

const route = useRoute()
// 支持从画像中间件分布下钻：?tab=web&httpServer=nginx
const queryForm = reactive<AssetWebQuery>({
  countryCode: (route.query.countryCode as string) || 'IN',
  httpServer: (route.query.httpServer as string) || undefined,
})

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetWeb({ ...queryForm, ...page }),
  { immediate: true },
)

const search = () => doSearch()
const reset = () => {
  Object.keys(queryForm).forEach((k) => (queryForm as any)[k] = undefined)
  queryForm.countryCode = 'IN'
  doSearch()
}

const columns: TableColumnData[] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => rowIndex + 1 + (pagination.current - 1) * pagination.pageSize },
  { title: '站点', width: 220, ellipsis: true, tooltip: true, render: ({ record }) => `${record.scheme}://${record.ipStr}:${record.port}` },
  { title: '状态码', width: 100, align: 'center', render: ({ record }) => (
    record.httpStatus
      ? <a-tag color={statusColor(record.httpStatus)} size="small">{record.httpStatus}</a-tag>
      : <span style="color: var(--color-text-4)">-</span>
  ) },
  { title: '标题', dataIndex: 'httpTitle', ellipsis: true, tooltip: true, width: 220 },
  { title: '中间件', dataIndex: 'httpServer', ellipsis: true, tooltip: true, width: 150 },
  { title: 'WAF', dataIndex: 'httpWaf', width: 110 },
  { title: '组织', dataIndex: 'org', ellipsis: true, tooltip: true, width: 160 },
  { title: '城市', dataIndex: 'city', width: 110 },
  { title: '采集时间', dataIndex: 'shodanTimestamp', width: 180 },
]
</script>
