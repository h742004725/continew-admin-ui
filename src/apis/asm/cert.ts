import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/asm'

/** @desc 证书资产列表 */
export function listAssetCert(query: T.AssetCertPageQuery) {
  return http.get<PageRes<T.AssetCertResp[]>>(`${BASE_URL}/certificate`, query)
}
