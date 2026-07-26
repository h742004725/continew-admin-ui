import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/asm'

/** @desc 主机(IP)列表 */
export function listAssetHost(query: T.AssetHostPageQuery) {
  return http.get<PageRes<T.AssetHostResp[]>>(`${BASE_URL}/host`, query)
}
