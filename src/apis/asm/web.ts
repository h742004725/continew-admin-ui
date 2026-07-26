import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/asm'

/** @desc Web 站点资产列表 */
export function listAssetWeb(query: T.AssetWebPageQuery) {
  return http.get<PageRes<T.AssetWebResp[]>>(`${BASE_URL}/web`, query)
}
