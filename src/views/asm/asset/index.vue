<template>
  <GiPageLayout>
    <a-tabs v-model:active-key="activeKey" type="rounded" @change="onChange">
      <a-tab-pane key="host" title="主机">
        <HostList v-if="activeKey === 'host'" />
      </a-tab-pane>
      <a-tab-pane key="service" title="服务">
        <ServiceList v-if="activeKey === 'service'" />
      </a-tab-pane>
      <a-tab-pane key="domain" title="域名">
        <DomainList v-if="activeKey === 'domain'" />
      </a-tab-pane>
    </a-tabs>
  </GiPageLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HostList from './components/HostList.vue'
import ServiceList from './components/ServiceList.vue'
import DomainList from './components/DomainList.vue'

defineOptions({ name: 'AsmAsset' })

const route = useRoute()
const router = useRouter()
const activeKey = ref<string>((route.query.tab as string) || 'host')

watch(() => route.query.tab, (tab) => {
  if (tab) activeKey.value = String(tab)
})

const onChange = (key: string | number) => {
  activeKey.value = String(key)
  router.replace({ path: route.path, query: { tab: activeKey.value } })
}
</script>
