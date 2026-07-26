<template>
  <GiPageLayout>
    <a-alert type="normal" style="margin-bottom: 16px">
      疆域解析基于各区域注册局（RIR）公开的 delegated 数据，把「国家」解析为该国的 ASN 与 IP 段边界，
      用于衡量测绘覆盖度并驱动后续定向采集。
    </a-alert>

    <GiTable
      row-key="countryCode"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="false"
      :disabled-tools="['size']"
      @refresh="fetchData"
    >
      <template #toolbar-left>
        <a-button type="primary" @click="resolveVisible = true">
          <template #icon><icon-plus /></template>
          <template #default>疆域解析</template>
        </a-button>
        <a-button @click="fetchData">
          <template #icon><icon-refresh /></template>
          <template #default>刷新</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link @click="onResolve(record.countryCode)">重新解析</a-link>
          <a-link @click="goAssets(record.countryCode)">查看资产</a-link>
        </a-space>
      </template>
    </GiTable>

    <!-- 疆域解析对话框 -->
    <a-modal v-model:visible="resolveVisible" title="疆域解析" :confirm-loading="resolving" @ok="doResolve">
      <a-form :model="form" layout="vertical">
        <a-form-item label="国家码" required>
          <a-input v-model="form.countryCode" placeholder="ISO 3166 alpha-2，如 IN / US / JP" />
        </a-form-item>
        <a-form-item label="国家名">
          <a-input v-model="form.countryName" placeholder="如 印度" />
        </a-form-item>
        <a-form-item label="ccTLD">
          <a-input v-model="form.cctld" placeholder="如 .in" />
        </a-form-item>
        <a-form-item label="注册局 RIR">
          <a-select v-model="form.rir" placeholder="留空则解析全部五大 RIR" allow-clear>
            <a-option v-for="r in RIRS" :key="r" :value="r">{{ r }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="本地文件（可选）">
          <a-input v-model="form.sourceKey" placeholder="留空则从 RIR 官网下载 delegated 文件" />
        </a-form-item>
      </a-form>
    </a-modal>
  </GiPageLayout>
</template>

<script setup lang="tsx">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { listRegion, resolveRegion, type RegionSeedResp } from '@/apis/asm'

defineOptions({ name: 'AsmRegion' })

const RIRS = ['apnic', 'ripe', 'arin', 'afrinic', 'lacnic']

const router = useRouter()
const loading = ref(false)
const dataList = ref<RegionSeedResp[]>([])
const resolveVisible = ref(false)
const resolving = ref(false)
const form = reactive({ countryCode: '', countryName: '', cctld: '', rir: undefined as string | undefined, sourceKey: '' })

const fetchData = async () => {
  try {
    loading.value = true
    const res = await listRegion()
    dataList.value = res.data || []
  } finally {
    loading.value = false
  }
}

const doResolve = async () => {
  if (!form.countryCode) {
    Message.warning('请填写国家码')
    return
  }
  try {
    resolving.value = true
    const res = await resolveRegion({ ...form })
    const d = res.data
    Message.success(`解析完成：ASN ${d.asnCount}(新增 ${d.insertedAsn})，IP 段 ${d.cidrCount}(新增 ${d.insertedCidr})`)
    resolveVisible.value = false
    fetchData()
  } finally {
    resolving.value = false
  }
}

const onResolve = async (countryCode: string) => {
  form.countryCode = countryCode
  resolveVisible.value = true
}

const goAssets = (countryCode: string) => {
  router.push({ path: '/asm/asset', query: { tab: 'host', countryCode } })
}

const fmt = (n?: number) => (n ?? 0).toLocaleString()

const columns: TableColumnData[] = [
  { title: '国家', width: 160, render: ({ record }) => `${record.countryName} (${record.countryCode})` },
  { title: 'ccTLD', dataIndex: 'cctld', width: 100 },
  { title: '监控', width: 90, align: 'center', render: ({ record }) => (
    record.monitorOn ? <a-tag color="green" size="small">监控中</a-tag> : <a-tag size="small">未启用</a-tag>
  ) },
  { title: '疆域 ASN', width: 110, align: 'right', render: ({ record }) => fmt(record.asnCount) },
  { title: '疆域 IP 段', width: 120, align: 'right', render: ({ record }) => fmt(record.cidrCount) },
  { title: 'IPv4 地址量', width: 150, align: 'right', render: ({ record }) => fmt(record.ipv4Total) },
  { title: '已测绘主机', width: 130, align: 'right', render: ({ record }) => fmt(record.hostCount) },
  { title: '覆盖率', width: 160, render: ({ record }) => (
    <div style="display:flex;align-items:center;gap:8px">
      <a-progress
        percent={Math.min((record.coverage || 0) / 100, 1)}
        size="small"
        style="flex:1"
        show-text={false}
        status={(record.coverage || 0) > 0 ? 'normal' : 'warning'}
      />
      <span style="font-variant-numeric:tabular-nums;min-width:52px;text-align:right">
        {(record.coverage ?? 0).toFixed(4)}%
      </span>
    </div>
  ) },
  { title: '最近解析', dataIndex: 'lastResolveTime', width: 180 },
  { title: '操作', slotName: 'action', width: 150, fixed: 'right' },
]

fetchData()
</script>
