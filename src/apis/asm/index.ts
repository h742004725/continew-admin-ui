import type * as T from './type'
import http from '@/utils/http'

export type * from './type'

const BASE_URL = '/asm'

/** @desc 查询服务资产列表 */
export function listAssetService(query: T.AssetServiceQuery & { page: number, size: number }) {
  return http.get<PageRes<T.AssetServiceResp[]>>(`${BASE_URL}/service`, query)
}

/** @desc 查询服务资产详情 */
export function getAssetService(id: string) {
  return http.get<T.AssetServiceDetailResp>(`${BASE_URL}/service/${id}`)
}

/** @desc 查询域名资产列表 */
export function listAssetDomain(query: T.AssetDomainQuery & { page: number, size: number }) {
  return http.get<PageRes<T.AssetDomainResp[]>>(`${BASE_URL}/domain`, query)
}

/** @desc 国家攻击面画像总览 */
export function getAssetOverview(countryCode?: string) {
  return http.get<T.AssetStatResp>(`${BASE_URL}/stat/overview`, { countryCode })
}

/** @desc 资产导入（Shodan NDJSON） */
export function importAsset(data: T.AssetImportReq) {
  return http.post<T.AssetImportResp>(`${BASE_URL}/import`, data)
}
