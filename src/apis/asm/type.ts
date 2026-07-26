export interface AssetServiceResp {
  id: string
  ipStr: string
  port: number
  transport: string
  product?: string
  productVersion?: string
  tags?: string[]
  hasHttp?: boolean
  hasSsl?: boolean
  city?: string
  org?: string
  asn?: string
  countryCode?: string
  httpTitle?: string
  httpServer?: string
  shodanTimestamp?: string
}

export interface AssetServiceChangeResp {
  changeType: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  changedAt?: string
}

export interface AssetServiceDetailResp {
  id: string
  sourcePlatform: string
  ipStr: string
  port: number
  transport: string
  product?: string
  productVersion?: string
  dataText?: string
  tags?: string[]
  shodanTimestamp?: string
  asn?: string
  isp?: string
  org?: string
  os?: string
  countryName?: string
  city?: string
  latitude?: number
  longitude?: number
  cloudProvider?: string
  hostnames?: string[]
  domains?: string[]
  firstSeen?: string
  lastSeen?: string
  httpStatus?: number
  httpTitle?: string
  httpServer?: string
  httpWaf?: string
  httpComponents?: Record<string, any>
  certSubjectCn?: string
  certIssuerCn?: string
  certExpired?: boolean
  certExpires?: string
  fpSha256?: string
  tlsVersions?: string[]
  ports?: AssetServiceResp[]
  changes?: AssetServiceChangeResp[]
  rawJson?: Record<string, any>
}

export interface AssetServiceQuery {
  ipStr?: string
  port?: number
  transport?: string
  product?: string
  httpTitle?: string
  org?: string
  domain?: string
  countryCode?: string
  exposed?: boolean
}
export interface AssetServicePageQuery extends AssetServiceQuery, PageQuery {}

export interface AssetDomainResp {
  domain: string
  ipCount: number
  serviceCount: number
  ipList?: string
  lastSeen?: string
}
export interface AssetDomainQuery {
  domain?: string
  countryCode?: string
}
export interface AssetDomainPageQuery extends AssetDomainQuery, PageQuery {}

/** 名称-数量分布项（画像分布图通用） */
export interface NameCountResp {
  name: string
  count: number
}

/** 国家攻击面画像总览 */
export interface AssetStatResp {
  countryCode: string
  hostCount: number
  serviceCount: number
  httpCount: number
  sslCount: number
  domainCount: number
  topPorts: NameCountResp[]
  topProducts: NameCountResp[]
  topServers: NameCountResp[]
  topAsn: NameCountResp[]
  exposureSummary: NameCountResp[]
}
