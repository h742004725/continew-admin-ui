<template>
  <GiTable
    row-key="id"
    :data="dataList"
    :columns="columns"
    :loading="loading"
    :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
    :pagination="pagination"
    :disabled-tools="['size']"
    @refresh="search"
  >
    <template #toolbar-left>
      <a-select v-model="queryForm.countryCode" style="width: 120px" @change="search">
        <a-option v-for="c in COUNTRY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</a-option>
      </a-select>
      <a-input v-model="queryForm.ipStr" placeholder="IP/网段" allow-clear style="width: 150px" @change="search" />
      <a-input v-model="queryForm.asn" placeholder="ASN" allow-clear style="width: 120px" @change="search" />
      <a-input v-model="queryForm.org" placeholder="组织" allow-clear style="width: 150px" @change="search" />
      <a-input v-model="queryForm.city" placeholder="城市" allow-clear style="width: 120px" @change="search" />
      <a-tooltip content="仅看存在暴露服务的主机">
        <a-switch v-model="queryForm.exposed" @change="search">
          <template #checked>暴露</template>
          <template #unchecked>暴露</template>
        </a-switch>
      </a-tooltip>
      <a-button type="primary" @click="search"><template #icon><icon-search /></template>查询</a-button>
      <a-button @click="reset">重置</a-button>
    </template>
    <template #action="{ record }">
      <a-link @click="onViewServices(record)">查看服务</a-link>
    </template>
  </GiTable>
</template>

<script setup lang="tsx">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { TableColumnData } from '@arco-design/web-vue'
import { listAssetHost, type AssetHostQuery, type AssetHostResp } from '@/apis/asm'
import { useTable } from '@/hooks'

const COUNTRY_OPTIONS = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]

const router = useRouter()
const queryForm = reactive<AssetHostQuery>({ countryCode: 'IN' })

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetHost({ ...queryForm, ...page }),
  { immediate: true },
)

const search = () => doSearch()
const reset = () => {
  Object.keys(queryForm).forEach((k) => (queryForm as any)[k] = undefined)
  queryForm.countryCode = 'IN'
  doSearch()
}

// 主机 → 服务下钻：按该 IP 过滤服务列表
const onViewServices = (record: AssetHostResp) => {
  router.push({ path: '/asm/asset', query: { tab: 'service', ipStr: record.ipStr, countryCode: queryForm.countryCode } })
}

const columns: TableColumnData[] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => rowIndex + 1 + (pagination.current - 1) * pagination.pageSize },
  { title: 'IP', dataIndex: 'ipStr', width: 130 },
  { title: '端口数', dataIndex: 'portCount', width: 90, align: 'center' },
  { title: '开放端口', width: 220, ellipsis: true, tooltip: true, render: ({ record }) => record.portList || '-' },
  { title: '暴露', width: 90, align: 'center', render: ({ record }) => (
    record.exposedCount > 0
      ? <a-tag color="red" size="small">{record.exposedCount}</a-tag>
      : <span style="color: var(--color-text-4)">-</span>
  ) },
  { title: 'Web', dataIndex: 'httpCount', width: 80, align: 'center' },
  { title: '域名数', dataIndex: 'domainCount', width: 90, align: 'center' },
  { title: 'ASN', dataIndex: 'asn', width: 110 },
  { title: '组织', dataIndex: 'org', ellipsis: true, tooltip: true, width: 160 },
  { title: '城市', dataIndex: 'city', width: 110, ellipsis: true, tooltip: true },
  { title: '最近发现', dataIndex: 'lastSeen', width: 180 },
  { title: '操作', slotName: 'action', width: 100, fixed: 'right' },
]
</script>
