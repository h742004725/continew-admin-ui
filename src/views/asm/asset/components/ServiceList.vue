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
      <a-space wrap :size="8">
        <a-select v-model="queryForm.countryCode" style="width: 120px" @change="search">
          <a-option v-for="c in COUNTRY_OPTIONS" :key="c.value" :value="c.value">{{ c.label }}</a-option>
        </a-select>
        <a-input v-model="queryForm.ipStr" placeholder="IP/网段" allow-clear style="width: 140px" @press-enter="search" />
        <a-input-number v-model="queryForm.port" placeholder="端口" allow-clear style="width: 100px" @press-enter="search" />
        <a-input v-model="queryForm.product" placeholder="产品" allow-clear style="width: 120px" @press-enter="search" />
        <a-input v-model="queryForm.httpTitle" placeholder="标题" allow-clear style="width: 120px" @press-enter="search" />
        <a-input v-model="queryForm.httpServer" placeholder="中间件" allow-clear style="width: 120px" @press-enter="search" />
        <a-input v-model="queryForm.domain" placeholder="域名" allow-clear style="width: 130px" @press-enter="search" />
        <a-tooltip content="仅看暴露资产（数据库/远程管理/证书过期）">
          <a-switch v-model="queryForm.exposed" @change="onExposedChange">
            <template #checked>暴露</template>
            <template #unchecked>暴露</template>
          </a-switch>
        </a-tooltip>
        <a-select
          v-if="queryForm.exposed"
          v-model="queryForm.exposureType"
          style="width: 150px"
          placeholder="暴露类别"
          @change="search"
        >
          <a-option v-for="t in EXPOSURE_TYPES" :key="t.value" :value="t.value">{{ t.label }}</a-option>
        </a-select>
        <a-button type="primary" @click="search"><template #icon><icon-search /></template>查询</a-button>
        <a-button @click="reset">重置</a-button>
      </a-space>
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

// 暴露类别（与后端 ExposureRules 对齐）
const EXPOSURE_TYPES = [
  { label: '全部暴露', value: 'ALL' },
  { label: '数据库直接暴露', value: 'DATABASE_EXPOSED' },
  { label: '远程管理暴露', value: 'REMOTE_MGMT' },
  { label: '证书过期', value: 'EXPIRED_CERT' },
]

const route = useRoute()
// 支持从画像页联动进入：?exposed=1&exposureType=xxx&countryCode=IN
const queryForm = reactive<AssetServiceQuery>({
  countryCode: (route.query.countryCode as string) || 'IN',
  exposed: route.query.exposed === '1' ? true : undefined,
  exposureType: (route.query.exposureType as string) || undefined,
  // 支持从主机列表下钻：?tab=service&ipStr=1.6.6.129
  ipStr: (route.query.ipStr as string) || undefined,
  // 支持从画像分布下钻：?port=443 / ?product=nginx / ?httpServer=nginx
  port: route.query.port ? Number(route.query.port) : undefined,
  product: (route.query.product as string) || undefined,
  httpServer: (route.query.httpServer as string) || undefined,
})

const { tableData: dataList, loading, pagination, search: doSearch } = useTable(
  (page) => listAssetService({ ...queryForm, ...page }),
  { immediate: true },
)

const search = () => doSearch()
// 开关暴露过滤：开启时默认查看全部暴露类别，关闭时清空类别
const onExposedChange = (val: boolean | string | number) => {
  queryForm.exposureType = val ? (queryForm.exposureType || 'ALL') : undefined
  doSearch()
}
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
  { title: '采集时间', dataIndex: 'shodanTimestamp', width: 180 },
  { title: '操作', slotName: 'action', width: 80, fixed: 'right' },
]

const detailRef = ref<InstanceType<typeof ServiceDetailDrawer>>()
const onDetail = (record: AssetServiceResp) => detailRef.value?.onOpen(record.id)
</script>
