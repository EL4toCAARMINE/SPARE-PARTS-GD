export type ReqItem = {
  id: number
  folio: number
  folioSap: number
  requesterName: string
  departmentName: string
  requiredDate: string | null
  documentDate: string | null
  destination?: string | null
  situationId: number
}
