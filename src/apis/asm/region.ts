import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/asm/region'

/** @desc 国家种子列表（含疆域规模与覆盖度） */
export function listRegion() {
  return http.get<T.RegionSeedResp[]>(`${BASE_URL}`)
}

/** @desc 疆域解析（country_code → ASN / IP 段） */
export function resolveRegion(data: T.RegionResolveReq) {
  return http.post<T.RegionResolveResp>(`${BASE_URL}/resolve`, data)
}
