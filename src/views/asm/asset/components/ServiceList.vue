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
      <a-input-number v-model="queryForm.port" placeholder="端口" allow-clear style="width: 110px" @change="search" />
      <a-input v-model="queryForm.product" placeholder="产品" allow-clear style="width: 130px" @change="search" />
      <a-input v-model="queryForm.httpTitle" placeholder="标题" allow-clear style="width: 130px" @change="search" />
      <a-input v-model="queryForm.domain" placeholder="域名" allow-clear style="width: 140px" @change="search" />
      <a-tooltip content="仅看数据库/远程管理等暴露端口">
        <a-switch v-model="queryForm.exposed" @change="search">
          <template #checked>暴露</template>
          <template #unchecked>暴露</template>
        </a-switch>
      </a-tooltip>
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
import { useRoute } from 'vue-router'
import type { TableColumnData } from '@arco-design/web-vue'
import { listAssetService, type AssetServiceQuery, type AssetServiceResp } from '@/apis/asm/asset'
import { useTable } from '@/hooks'
import ServiceDetailDrawer from '../ServiceDetailDrawer.vue'

// 暴露端口集合（与后端 ExposureRules 对齐：数据库 + 远程管理）
const EXPOSED_PORTS = new Set([3306, 5432, 6379, 27017, 9200, 1433, 11211, 9042, 5984, 3389, 5900, 5901, 5985, 5986, 23])
const COUNTRY_OPTIONS = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]

const route = useRoute()
// 支持从画像页联动进入并默认开启「暴露」过滤（/asm/asset?exposed=1）
const queryForm = reactive<AssetServiceQuery>({ countryCode: 'IN', exposed: route.query.exposed === '1' ? true : undefined })

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetService({ ...queryForm, ...page }),
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
  { title: 'IP', dataIndex: 'ipStr', width: 130 },
  { title: '端口', width: 140, render: ({ record }) => (
    <span>
      {record.port}/{record.transport}
      {EXPOSED_PORTS.has(record.port) ? <a-tag color="red" size="small" style="margin-left: 6px">暴露</a-tag> : null}
    </span>
  ) },
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
