export interface billingTypeResponse {
   codeType: string,
   codeId: string,
   codeDesc: string,
   codeAccess: string,
   codefor: null,
}

export interface pinCodeResponse {
   value: string,
   text: string,
   odAcategory: string,
   destination: string,
   pinArea: string,
   toCity: string
}

export interface cityResponse {
   location: string
}