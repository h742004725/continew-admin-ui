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
      <a-input v-model="queryForm.certSubjectCn" placeholder="主题 CN" allow-clear style="width: 170px" @change="search" />
      <a-input v-model="queryForm.certIssuerCn" placeholder="颁发者" allow-clear style="width: 150px" @change="search" />
      <a-input v-model="queryForm.ipStr" placeholder="IP/网段" allow-clear style="width: 140px" @change="search" />
      <a-tooltip content="仅看已过期证书">
        <a-switch v-model="queryForm.expired" @change="search">
          <template #checked>已过期</template>
          <template #unchecked>已过期</template>
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
import { listAssetCert, type AssetCertQuery } from '@/apis/asm'
import { useTable } from '@/hooks'

const COUNTRY_OPTIONS = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]

const route = useRoute()
// 支持从画像「证书过期」下钻：?tab=cert&expired=1
const queryForm = reactive<AssetCertQuery>({
  countryCode: (route.query.countryCode as string) || 'IN',
  expired: route.query.expired === '1' ? true : undefined,
})

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetCert({ ...queryForm, ...page }),
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
  { title: '主题 CN', dataIndex: 'certSubjectCn', ellipsis: true, tooltip: true, width: 200 },
  { title: '颁发者', dataIndex: 'certIssuerCn', ellipsis: true, tooltip: true, width: 160 },
  { title: '状态', width: 100, align: 'center', render: ({ record }) => (
    record.certExpired
      ? <a-tag color="red" size="small">已过期</a-tag>
      : <a-tag color="green" size="small">有效</a-tag>
  ) },
  { title: '过期时间', dataIndex: 'certExpires', width: 180 },
  { title: 'IP:端口', width: 170, render: ({ record }) => `${record.ipStr}:${record.port}` },
  { title: '组织', dataIndex: 'org', ellipsis: true, tooltip: true, width: 160 },
  { title: '城市', dataIndex: 'city', width: 110 },
  { title: '指纹 SHA256', dataIndex: 'fpSha256', ellipsis: true, tooltip: true, width: 160 },
]
</script>
