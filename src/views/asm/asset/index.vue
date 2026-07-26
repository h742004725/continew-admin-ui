<template>
  <GiPageLayout>
    <a-tabs v-model:active-key="activeTab" type="rounded" @change="onTabChange">
      <a-tab-pane key="service" title="服务资产">
        <GiTable
          row-key="id"
          :data="serviceList"
          :columns="serviceColumns"
          :loading="serviceLoading"
          :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
          :pagination="servicePagination"
          :disabled-tools="['size']"
          @refresh="searchService"
        >
          <template #toolbar-left>
            <a-select v-model="queryForm.countryCode" style="width: 130px" @change="searchService">
              <a-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{ c.label }}</a-option>
            </a-select>
            <a-input v-model="queryForm.ipStr" placeholder="IP / 网段前缀" allow-clear style="width: 160px" @press-enter="searchService" />
            <a-input-number v-model="queryForm.port" placeholder="端口" allow-clear style="width: 110px" @press-enter="searchService" />
            <a-input v-model="queryForm.product" placeholder="产品/服务" allow-clear style="width: 140px" @press-enter="searchService" />
            <a-input v-model="queryForm.httpTitle" placeholder="标题" allow-clear style="width: 140px" @press-enter="searchService" />
            <a-button type="primary" @click="searchService">
              <template #icon><icon-search /></template>
              <template #default>查询</template>
            </a-button>
            <a-button @click="resetService">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </template>
          <template #httpFlags="{ record }">
            <a-space>
              <a-tag v-if="record.hasHttp" color="arcoblue" size="small">HTTP</a-tag>
              <a-tag v-if="record.hasSsl" color="green" size="small">SSL</a-tag>
              <a-tag v-if="isExposed(record.port)" color="red" size="small">暴露</a-tag>
            </a-space>
          </template>
          <template #action="{ record }">
            <a-link v-permission="['asm:service:get']" title="详情" @click="onDetail(record)">详情</a-link>
          </template>
        </GiTable>
      </a-tab-pane>

      <a-tab-pane key="domain" title="域名资产">
        <GiTable
          row-key="domain"
          :data="domainList"
          :columns="domainColumns"
          :loading="domainLoading"
          :scroll="{ x: '100%', y: '100%', minWidth: 800 }"
          :pagination="domainPagination"
          :disabled-tools="['size']"
          @refresh="searchDomain"
        >
          <template #toolbar-left>
            <a-select v-model="domainForm.countryCode" style="width: 130px" @change="searchDomain">
              <a-option v-for="c in countryOptions" :key="c.value" :value="c.value">{{ c.label }}</a-option>
            </a-select>
            <a-input-search v-model="domainForm.domain" placeholder="搜索域名" allow-clear style="width: 220px" @search="searchDomain" />
          </template>
        </GiTable>
      </a-tab-pane>
    </a-tabs>

    <!-- 服务详情抽屉 -->
    <a-drawer v-model:visible="detailVisible" :width="isMobile() ? '100%' : 760" title="服务资产详情" :footer="false">
      <a-spin :loading="detailLoading" style="width: 100%">
        <a-descriptions title="服务" :column="2" bordered size="medium">
          <a-descriptions-item label="IP">{{ detail?.ipStr }}</a-descriptions-item>
          <a-descriptions-item label="端口">{{ detail?.port }} / {{ detail?.transport }}</a-descriptions-item>
          <a-descriptions-item label="产品">{{ detail?.product || '-' }}</a-descriptions-item>
          <a-descriptions-item label="版本">{{ detail?.productVersion || '-' }}</a-descriptions-item>
          <a-descriptions-item label="来源">{{ detail?.sourcePlatform }}</a-descriptions-item>
          <a-descriptions-item label="采集时间">{{ detail?.shodanTimestamp || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-descriptions title="主机" :column="2" bordered size="medium" style="margin-top: 16px">
          <a-descriptions-item label="ASN">{{ detail?.asn || '-' }}</a-descriptions-item>
          <a-descriptions-item label="组织">{{ detail?.org || '-' }}</a-descriptions-item>
          <a-descriptions-item label="ISP">{{ detail?.isp || '-' }}</a-descriptions-item>
          <a-descriptions-item label="云厂商">{{ detail?.cloudProvider || '-' }}</a-descriptions-item>
          <a-descriptions-item label="国家/城市">{{ detail?.countryName || '-' }} / {{ detail?.city || '-' }}</a-descriptions-item>
          <a-descriptions-item label="操作系统">{{ detail?.os || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-descriptions v-if="detail?.hasHttp" title="Web" :column="2" bordered size="medium" style="margin-top: 16px">
          <a-descriptions-item label="状态码">{{ detail?.httpStatus ?? '-' }}</a-descriptions-item>
          <a-descriptions-item label="Server">{{ detail?.httpServer || '-' }}</a-descriptions-item>
          <a-descriptions-item label="标题" :span="2">{{ detail?.httpTitle || '-' }}</a-descriptions-item>
          <a-descriptions-item label="WAF">{{ detail?.httpWaf || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-descriptions v-if="detail?.hasSsl" title="证书" :column="2" bordered size="medium" style="margin-top: 16px">
          <a-descriptions-item label="主题 CN">{{ detail?.certSubjectCn || '-' }}</a-descriptions-item>
          <a-descriptions-item label="颁发者 CN">{{ detail?.certIssuerCn || '-' }}</a-descriptions-item>
          <a-descriptions-item label="是否过期">
            <a-tag :color="detail?.certExpired ? 'red' : 'green'">{{ detail?.certExpired ? '已过期' : '有效' }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="过期时间">{{ detail?.certExpires || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-divider orientation="left" style="margin-top: 16px">同 IP 端口（{{ detail?.ports?.length || 0 }}）</a-divider>
        <a-space wrap>
          <a-tag v-for="p in detail?.ports" :key="p.id" :color="isExposed(p.port) ? 'red' : 'arcoblue'">{{ p.port }}/{{ p.transport }}</a-tag>
          <span v-if="!detail?.ports?.length">-</span>
        </a-space>

        <a-divider orientation="left" style="margin-top: 16px">变更历史</a-divider>
        <a-timeline v-if="detail?.changes?.length">
          <a-timeline-item v-for="(c, i) in detail?.changes" :key="i" :label="c.changedAt">
            <a-tag :color="changeColor(c.changeType)" size="small">{{ changeLabel(c.changeType) }}</a-tag>
            <span v-if="c.fieldName" style="margin-left: 8px">
              {{ c.fieldName }}：<span style="color: var(--color-text-3)">{{ c.oldValue ?? '∅' }}</span> → {{ c.newValue ?? '∅' }}
            </span>
          </a-timeline-item>
        </a-timeline>
        <a-empty v-else description="暂无变更" />

        <a-divider orientation="left" style="margin-top: 16px">原始记录</a-divider>
        <pre class="raw-json">{{ prettyJson(detail?.rawJson) }}</pre>
      </a-spin>
    </a-drawer>
  </GiPageLayout>
</template>

<script setup lang="ts">
import type { TableInstance } from '@arco-design/web-vue'
import {
  type AssetDomainQuery,
  type AssetServiceDetailResp,
  type AssetServiceQuery,
  type AssetServiceResp,
  getAssetService,
  listAssetDomain,
  listAssetService,
} from '@/apis/asm'
import { useTable } from '@/hooks'
import { isMobile } from '@/utils'

defineOptions({ name: 'AsmAsset' })

const countryOptions = [
  { label: '印度 IN', value: 'IN' },
  { label: '美国 US', value: 'US' },
  { label: '日本 JP', value: 'JP' },
  { label: '中国 CN', value: 'CN' },
]
// 高危暴露端口（与后端 ExposureRules 对齐，用于列表打标）
const EXPOSED_PORTS = new Set([3306, 5432, 6379, 27017, 9200, 1433, 11211, 9042, 5984, 3389, 5900, 5901, 5985, 5986, 23])
const isExposed = (port?: number) => port != null && EXPOSED_PORTS.has(port)

const activeTab = ref<'service' | 'domain'>('service')

/* ---------------- 服务资产 ---------------- */
const queryForm = reactive<AssetServiceQuery>({ countryCode: 'IN' })
const {
  tableData: serviceList,
  loading: serviceLoading,
  pagination: servicePagination,
  search: searchService,
} = useTable((page) => listAssetService({ ...queryForm, ...page }), { immediate: true })

const serviceColumns: TableInstance['columns'] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (servicePagination.current - 1) * servicePagination.pageSize) },
  { title: 'IP', dataIndex: 'ipStr', width: 140 },
  { title: '端口', dataIndex: 'port', width: 90, align: 'center' },
  { title: '协议', dataIndex: 'transport', width: 80, align: 'center' },
  { title: '产品', dataIndex: 'product', width: 130, ellipsis: true, tooltip: true },
  { title: '版本', dataIndex: 'productVersion', width: 100, ellipsis: true, tooltip: true },
  { title: '标题', dataIndex: 'httpTitle', width: 180, ellipsis: true, tooltip: true },
  { title: 'Server', dataIndex: 'httpServer', width: 140, ellipsis: true, tooltip: true },
  { title: '组织', dataIndex: 'org', width: 160, ellipsis: true, tooltip: true },
  { title: '城市', dataIndex: 'city', width: 110, ellipsis: true, tooltip: true },
  { title: '标记', slotName: 'httpFlags', width: 150 },
  { title: '采集时间', dataIndex: 'shodanTimestamp', width: 170 },
  { title: '操作', slotName: 'action', width: 80, align: 'center', fixed: !isMobile() ? 'right' : undefined },
]

const resetService = () => {
  queryForm.ipStr = undefined
  queryForm.port = undefined
  queryForm.product = undefined
  queryForm.httpTitle = undefined
  searchService()
}

/* ---------------- 域名资产 ---------------- */
const domainForm = reactive<AssetDomainQuery>({ countryCode: 'IN' })
const {
  tableData: domainList,
  loading: domainLoading,
  pagination: domainPagination,
  search: searchDomain,
} = useTable((page) => listAssetDomain({ ...domainForm, ...page }), { immediate: false })

const domainColumns: TableInstance['columns'] = [
  { title: '序号', width: 66, align: 'center', render: ({ rowIndex }) => h('span', {}, rowIndex + 1 + (domainPagination.current - 1) * domainPagination.pageSize) },
  { title: '域名', dataIndex: 'domain', minWidth: 220, ellipsis: true, tooltip: true },
  { title: '关联 IP 数', dataIndex: 'ipCount', width: 110, align: 'center' },
  { title: '服务数', dataIndex: 'serviceCount', width: 100, align: 'center' },
  { title: 'IP 列表', dataIndex: 'ipList', minWidth: 200, ellipsis: true, tooltip: true },
  { title: '最近发现', dataIndex: 'lastSeen', width: 170 },
]

let domainLoaded = false
const onTabChange = (key: string | number) => {
  if (key === 'domain' && !domainLoaded) {
    domainLoaded = true
    searchDomain()
  }
}

/* ---------------- 详情抽屉 ---------------- */
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<AssetServiceDetailResp>()

const onDetail = async (record: AssetServiceResp) => {
  detailVisible.value = true
  detail.value = undefined
  try {
    detailLoading.value = true
    const res = await getAssetService(record.id)
    detail.value = res.data
  } finally {
    detailLoading.value = false
  }
}

const CHANGE_META: Record<string, { label: string, color: string }> = {
  FIRST_SEEN: { label: '首次发现', color: 'green' },
  FIELD_CHANGED: { label: '字段变更', color: 'orange' },
  PORT_ADDED: { label: '端口新增', color: 'arcoblue' },
  PORT_REMOVED: { label: '端口下线', color: 'red' },
}
const changeLabel = (t?: string) => (t && CHANGE_META[t]?.label) || t || '-'
const changeColor = (t?: string) => (t && CHANGE_META[t]?.color) || 'gray'

const prettyJson = (obj?: Record<string, any>) => {
  if (!obj) {
    return '-'
  }
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
</script>

<style scoped lang="scss">
.raw-json {
  max-height: 320px;
  overflow: auto;
  padding: 12px;
  background: var(--color-fill-2);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
