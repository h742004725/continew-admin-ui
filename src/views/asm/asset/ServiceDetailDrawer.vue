<template>
  <a-drawer v-model:visible="visible" :width="width >= 720 ? 720 : '100%'" :footer="false" title="服务详情">
    <a-spin :loading="loading" style="width: 100%">
      <a-descriptions title="概览" :column="2" bordered size="medium">
        <a-descriptions-item label="IP">{{ detail?.ipStr }}</a-descriptions-item>
        <a-descriptions-item label="端口/协议">{{ detail?.port }}/{{ detail?.transport }}</a-descriptions-item>
        <a-descriptions-item label="产品">{{ [detail?.product, detail?.productVersion].filter(Boolean).join(' ') || '-' }}</a-descriptions-item>
        <a-descriptions-item label="国家/城市">{{ detail?.countryName }} {{ detail?.city }}</a-descriptions-item>
        <a-descriptions-item label="组织">{{ detail?.org || '-' }}</a-descriptions-item>
        <a-descriptions-item label="ASN/ISP">{{ detail?.asn }} {{ detail?.isp }}</a-descriptions-item>
        <a-descriptions-item label="云厂商">{{ detail?.cloudProvider || '-' }}</a-descriptions-item>
        <a-descriptions-item label="采集时间">{{ detail?.shodanTimestamp || '-' }}</a-descriptions-item>
        <a-descriptions-item label="域名" :span="2">{{ (detail?.domains || []).join(', ') || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions v-if="detail?.hasHttp !== false && (detail?.httpTitle || detail?.httpServer || detail?.httpStatus)"
        title="Web" :column="2" bordered size="medium" style="margin-top: 16px">
        <a-descriptions-item label="状态码">{{ detail?.httpStatus ?? '-' }}</a-descriptions-item>
        <a-descriptions-item label="标题">{{ detail?.httpTitle || '-' }}</a-descriptions-item>
        <a-descriptions-item label="Server">{{ detail?.httpServer || '-' }}</a-descriptions-item>
        <a-descriptions-item label="WAF">{{ detail?.httpWaf || '-' }}</a-descriptions-item>
        <a-descriptions-item label="组件" :span="2">{{ componentNames || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions v-if="detail?.certSubjectCn || detail?.fpSha256"
        title="证书" :column="2" bordered size="medium" style="margin-top: 16px">
        <a-descriptions-item label="主题 CN">{{ detail?.certSubjectCn || '-' }}</a-descriptions-item>
        <a-descriptions-item label="颁发者">{{ detail?.certIssuerCn || '-' }}</a-descriptions-item>
        <a-descriptions-item label="是否过期">{{ detail?.certExpired ? '是' : '否' }}</a-descriptions-item>
        <a-descriptions-item label="过期时间">{{ detail?.certExpires || '-' }}</a-descriptions-item>
        <a-descriptions-item label="TLS 版本" :span="2">{{ (detail?.tlsVersions || []).join(', ') || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-typography-title :heading="6" style="margin-top: 16px">Banner</a-typography-title>
      <a-typography-text code style="white-space: pre-wrap; word-break: break-all">{{ detail?.dataText || '-' }}</a-typography-text>

      <a-typography-title :heading="6" style="margin-top: 16px">同 IP 端口</a-typography-title>
      <a-space wrap>
        <a-tag v-for="p in detail?.ports || []" :key="p.id" :color="p.id === detail?.id ? 'arcoblue' : 'gray'">
          {{ p.port }}/{{ p.transport }} {{ p.product || '' }}
        </a-tag>
      </a-space>

      <a-typography-title :heading="6" style="margin-top: 16px">变更历史</a-typography-title>
      <a-timeline v-if="(detail?.changes || []).length">
        <a-timeline-item v-for="(c, i) in detail?.changes" :key="i" :label="c.changedAt">
          <span v-if="c.changeType === 'FIRST_SEEN'">首次发现</span>
          <span v-else-if="c.changeType === 'FIELD_CHANGED'">{{ c.fieldName }}：{{ c.oldValue }} → {{ c.newValue }}</span>
          <span v-else-if="c.changeType === 'PORT_ADDED'">端口新增</span>
          <span v-else-if="c.changeType === 'PORT_REMOVED'">端口消失</span>
          <span v-else>{{ c.changeType }}</span>
        </a-timeline-item>
      </a-timeline>
      <a-empty v-else description="暂无历史变更（需二次导入后产生对比）" />

      <a-collapse style="margin-top: 16px">
        <a-collapse-item header="原始 JSON" key="raw">
          <pre style="max-height: 320px; overflow: auto">{{ JSON.stringify(detail?.rawJson, null, 2) }}</pre>
        </a-collapse-item>
      </a-collapse>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { getAssetService, type AssetServiceDetailResp } from '@/apis/asm/asset'

const { width } = useWindowSize()
const visible = ref(false)
const loading = ref(false)
const detail = ref<AssetServiceDetailResp>()

const componentNames = computed(() => detail.value?.httpComponents ? Object.keys(detail.value.httpComponents).join(', ') : '')

const onOpen = async (id: string) => {
  visible.value = true
  loading.value = true
  try {
    const { data } = await getAssetService(id)
    detail.value = data
  } finally {
    loading.value = false
  }
}

defineExpose({ onOpen })
</script>
