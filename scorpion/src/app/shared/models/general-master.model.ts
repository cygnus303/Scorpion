export interface generalMasterResponse {
   codeType: string,
   codeId: string,
   codeDesc: string
}

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

export interface billingPartyRequest {
   searchTerm: string,
   paybs: string,
   location: string
}
export interface DestinationsList{
   locCode: string,
   locName: string,
   locRegion: string,
}
export interface billingPartyResponse {
   custcd: string,
   custnm: string,
   vol_yn: string
}

export interface VehicleNumbersResponse {
 vehno:string;
}

export interface GSTNOListResponse {
    lgnm: string;
    tradeNam: string;
    address: string;
    location: string;
    bno: string;
    dst: string;
    stcd: string;
    flno: string;
    pncd: string;
    dty: string;
}

export interface DKTChargesResponse{
    chargeCode: string,
    chargeName: string,
    operator: string,
    chargeAmount: number,
    fixCharge: number
}