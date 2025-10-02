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
