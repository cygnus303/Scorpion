export interface VendeorsResponse {
    vendor_Code: string;
    vendor_Name: string;
}

export interface CityResponse {
    location: string,
    city_code:number
}

export interface VehicleTyperesponse{
    codeId:string,
    codeDesc:string
}

export interface VehicleTypeListResponse{
    type_Name:string,
    typeCode:string
}