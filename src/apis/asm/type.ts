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
  /** Web 中间件 Server 头（精确匹配，画像下钻用） */
  httpServer?: string
  org?: string
  domain?: string
  countryCode?: string
  exposed?: boolean
  /** 暴露类别：DATABASE_EXPOSED / REMOTE_MGMT / EXPIRED_CERT / ALL */
  exposureType?: string
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
  /** 类别代码（暴露面汇总用于下钻） */
  code?: string
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

/** 主机(IP)资产 */
export interface AssetHostResp {
  id: string
  ipStr: string
  asn?: string
  isp?: string
  org?: string
  os?: string
  countryCode?: string
  city?: string
  cloudProvider?: string
  portCount?: number
  portList?: string
  httpCount?: number
  exposedCount?: number
  domainCount?: number
  firstSeen?: string
  lastSeen?: string
}
export interface AssetHostQuery {
  ipStr?: string
  asn?: string
  org?: string
  city?: string
  countryCode?: string
  exposed?: boolean
}
export interface AssetHostPageQuery extends AssetHostQuery, PageQuery {}

/** 证书资产 */
export interface AssetCertResp {
  serviceId: string
  ipStr: string
  port: number
  certSubjectCn?: string
  certIssuerCn?: string
  certExpired?: boolean
  certIssued?: string
  certExpires?: string
  fpSha256?: string
  jarm?: string
  org?: string
  city?: string
}
export interface AssetCertQuery {
  certSubjectCn?: string
  certIssuerCn?: string
  ipStr?: string
  expired?: boolean
  countryCode?: string
}
export interface AssetCertPageQuery extends AssetCertQuery, PageQuery {}

/** Web 站点资产 */
export interface AssetWebResp {
  serviceId: string
  ipStr: string
  port: number
  scheme?: string
  httpStatus?: number
  httpTitle?: string
  httpServer?: string
  httpWaf?: string
  org?: string
  city?: string
  shodanTimestamp?: string
}
export interface AssetWebQuery {
  httpTitle?: string
  httpServer?: string
  httpStatus?: number
  ipStr?: string
  httpsOnly?: boolean
  countryCode?: string
}
export interface AssetWebPageQuery extends AssetWebQuery, PageQuery {}

/** 国家种子（疆域） */
export interface RegionSeedResp {
  id: string
  countryCode: string
  countryName: string
  cctld?: string
  monitorOn?: boolean
  asnCount?: number
  cidrCount?: number
  ipv4Total?: number
  hostCount?: number
  coverage?: number
  lastResolveTime?: string
}
export interface RegionResolveReq {
  countryCode: string
  countryName?: string
  cctld?: string
  rir?: string
  sourceKey?: string
}
export interface RegionResolveResp {
  countryCode: string
  asnCount: number
  cidrCount: number
  insertedAsn: number
  insertedCidr: number
  ipv4Total: number
  sources: string
}
