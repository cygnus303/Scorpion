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

export interface GSTDetailResponse{
    status: number,
    message: string,
    partyCode: string,
    partyName:string,
    invno: string,
    invdt: string,
    decval: number,
    eWayBillExpiredDate:string,
    eWayInvoicevalue: number,
    eWayBillInvoiceDate: string,
    consignor: string,
    consignee: string,
    fromCity:string,
    toCity: string,
    paybas: string,
    pincode: number,
    area: string,
    csgncd: string,
    csgnm: string,
    csgnAdd: string,
    csgecd: string,
    csgenm: string,
    csgeAdd: string,
    toPincode: number
}

export interface ChargingRepsonse{
    chargeCode: string,
    chargeName: string,
    operator: string,
    chargeAmount: number,
    fixCharge: number
}