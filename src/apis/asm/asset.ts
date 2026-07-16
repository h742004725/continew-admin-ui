import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/asm'

/** @desc 服务列表 */
export function listAssetService(query: T.AssetServicePageQuery) {
  return http.get<PageRes<T.AssetServiceResp[]>>(`${BASE_URL}/service`, query)
}

/** @desc 服务详情 */
export function getAssetService(id: string) {
  return http.get<T.AssetServiceDetailResp>(`${BASE_URL}/service/${id}`)
}

/** @desc 域名列表 */
export function listAssetDomain(query: T.AssetDomainPageQuery) {
  return http.get<PageRes<T.AssetDomainResp[]>>(`${BASE_URL}/domain`, query)
}
