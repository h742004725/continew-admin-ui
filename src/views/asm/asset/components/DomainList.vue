<template>
  <GiTable
    row-key="domain"
    :data="dataList"
    :columns="columns"
    :loading="loading"
    :scroll="{ x: '100%', y: '100%', minWidth: 800 }"
    :pagination="pagination"
    :disabled-tools="['size']"
    @refresh="search"
  >
    <template #toolbar-left>
      <a-space wrap :size="8">
        <a-select v-model="queryForm.countryCode" style="width: 120px" @change="search">
          <a-option v-for="c in COUNTRY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</a-option>
        </a-select>
        <a-input v-model="queryForm.domain" placeholder="域名关键字" allow-clear style="width: 200px" @press-enter="search" />
        <a-button type="primary" @click="search"><template #icon><icon-search /></template>查询</a-button>
        <a-button @click="reset">重置</a-button>
      </a-space>
    </template>
  </GiTable>
</template>

<script setup lang="tsx">
import { reactive } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { listAssetDomain, type AssetDomainQuery } from '@/apis/asm/asset'
import { useTable } from '@/hooks'

const COUNTRY_OPTIONS = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]

const queryForm = reactive<AssetDomainQuery>({ countryCode: 'IN' })

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetDomain({ ...queryForm, ...page }),
  { immediate: true },
)

const search = () => doSearch()
const reset = () => {
  queryForm.domain = undefined
  doSearch()
}

const columns: TableColumnData[] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => rowIndex + 1 + (pagination.current - 1) * pagination.pageSize },
  { title: '域名', dataIndex: 'domain', ellipsis: true, tooltip: true },
  { title: '解析 IP', dataIndex: 'ipList', ellipsis: true, tooltip: true },
  { title: 'IP 数', dataIndex: 'ipCount', width: 90 },
  { title: '关联服务数', dataIndex: 'serviceCount', width: 110 },
  { title: '最近发现', dataIndex: 'lastSeen', width: 180 },
]
</script>
