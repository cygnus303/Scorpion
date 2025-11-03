export interface VendeorsResponse {
    vendor_Code: string;
    vendor_Name: string;
}

export interface CityResponse {
    location: string,
    city_code:number
}

export interface CodeResponse {
  codeId: string;
  codeDesc: string;
}

export type VehicleTyperesponse = CodeResponse;
export type AirportListResponse = CodeResponse;
export type FlightsListResponse = CodeResponse;

export interface VehicleTypeListResponse{
    type_Name:string,
    typeCode:string
}

export interface CustomerListResponse{
    id:string,
    text:string
}

export type AllCityByLocationResponse = CustomerListResponse;

export interface ChargesResponse {
 chargecode: string;
 chargename: string;
 operator: string;
 acccode: string;
 chargeAmount:number;
 cnt: number;
}

export interface DeliveryZoneResponse{
    value:string,
    text:string
}