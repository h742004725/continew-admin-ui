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
      <a-input v-model="queryForm.ipStr" placeholder="IP/网段" allow-clear style="width: 150px" @change="search" />
      <a-input-number v-model="queryForm.port" placeholder="端口" allow-clear style="width: 110px" @change="search" />
      <a-input v-model="queryForm.product" placeholder="产品" allow-clear style="width: 130px" @change="search" />
      <a-input v-model="queryForm.httpTitle" placeholder="标题" allow-clear style="width: 130px" @change="search" />
      <a-input v-model="queryForm.domain" placeholder="域名" allow-clear style="width: 140px" @change="search" />
      <a-button type="primary" @click="search"><template #icon><icon-search /></template>查询</a-button>
      <a-button @click="reset">重置</a-button>
    </template>
    <template #action="{ record }">
      <a-link v-permission="['asm:service:get']" @click="onDetail(record)">详情</a-link>
    </template>
  </GiTable>

  <ServiceDetailDrawer ref="detailRef" />
</template>

<script setup lang="tsx">
import { reactive, ref } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { listAssetService, type AssetServiceQuery, type AssetServiceResp } from '@/apis/asm/asset'
import { useTable } from '@/hooks'
import ServiceDetailDrawer from '../ServiceDetailDrawer.vue'

const queryForm = reactive<AssetServiceQuery>({})

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetService({ ...queryForm, ...page }),
  { immediate: true },
)

const search = () => doSearch()
const reset = () => {
  Object.keys(queryForm).forEach((k) => (queryForm as any)[k] = undefined)
  doSearch()
}

const columns: TableColumnData[] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => rowIndex + 1 + (pagination.current - 1) * pagination.pageSize },
  { title: 'IP', dataIndex: 'ipStr', width: 130 },
  { title: '端口', width: 100, render: ({ record }) => `${record.port}/${record.transport}` },
  { title: '城市', dataIndex: 'city', width: 100 },
  { title: '产品', width: 150, render: ({ record }) => [record.product, record.productVersion].filter(Boolean).join(' ') || '-' },
  { title: '标题', dataIndex: 'httpTitle', ellipsis: true, tooltip: true, width: 180 },
  { title: 'Server', dataIndex: 'httpServer', width: 130 },
  { title: '组织', dataIndex: 'org', ellipsis: true, tooltip: true, width: 160 },
  { title: '采集时间', dataIndex: 'shodanTimestamp', width: 160 },
  { title: '操作', slotName: 'action', width: 80, fixed: 'right' },
]

const detailRef = ref<InstanceType<typeof ServiceDetailDrawer>>()
const onDetail = (record: AssetServiceResp) => detailRef.value?.onOpen(record.id)
</script>
