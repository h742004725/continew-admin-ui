import type * as T from './type'
import http from '@/utils/http'

const BASE_URL = '/asm'

/** @desc 国家攻击面画像总览 */
export function getAssetOverview(countryCode?: string) {
  return http.get<T.AssetStatResp>(`${BASE_URL}/stat/overview`, { countryCode })
}
