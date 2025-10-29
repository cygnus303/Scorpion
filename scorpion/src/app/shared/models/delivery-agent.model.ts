export interface DeliveryAgent {
  dA_Code: number;
  deliveryAgentName: string;
  deliveryAgentMobile: string;
  vehicleNo: string;
  registrationDate: string;   // ISO date string
  engineNo: string;
  chassisNo: string;
  rcBookNo: string;
  insuranceValidityDate: string; // ISO date string
  permitValidityDate: string;    // ISO date string
  fitnessValidityDate: string;   // ISO date string
  licenseNo: string;
  dateOfBirth: string;           // ISO date string
  issueByRTO: string;
  licenseValidityDate: string;   // ISO date string
  businessAssociateVendor: string;
  fTlType: string;
  gpsEnabled: boolean;
  gpsProvider: string;
  location: string;
  licenseAttachment: string;
  entryBy: string;
  updateBy: string;
  LicenseAttachmentPath:File;
}

export interface DeliveryAgentsListRepsonse {
  srno:number;
 dA_Code: number;
 deliveryAgentName: string;
 location: string;
 isActive: boolean;
 baName:string;
 vehicleNo:string;
 licenseNo:string;
}

export interface DeliveryAgentByCodeResponse {
    dA_Code: string;
    deliveryAgentName: string;
    deliveryAgentMobile: string;
    fTlName:string;
    vehicleNo: string;
    registrationDate: string;
    engineNo: string;
    chassisNo: string;
    rcBookNo: string;
    insuranceValidityDate: string;
    permitValidityDate: string;
    fitnessValidityDate: string;
    licenseNo: string;
    dateOfBirth: string;
    issueByRTO: string;
    licenseValidityDate: string;
    businessAssociateVendor: string;
    fTlType: string;
    gpsEnabled: boolean;
    gpsName:string;
    gpsProvider: string;
    location: string;
    licenseAttachment: string;
    isActive: boolean;
    entryBy: string;
    businessAssociatecode:string;
    locationName:string
    updateBy:string;
    entryDate:string;
    updatedDate:string;
    entryName:string;
    updateName:string;
}
export interface VendorsListResponse {
 vendorCode:string;
 vendorName: string;
}

export interface LocationListResponse{
   locCode: string,
   locName: string
}