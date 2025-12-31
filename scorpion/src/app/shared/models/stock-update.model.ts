export interface UnloaderUsers {
  userId: string;
  name: string;
  entryDate: string;          // or Date
  lastUpdatedDate: string;    // or Date
  dob: string;                // or Date
  conveyanceExpance: number;
  ratings: number;
  leaveGroupId: number;
  issfmmaster: boolean;
}

export interface WarehouseList {
    activeFlag: string;
    godown_name: string;
    updton: string;
    spdbrcd: string;
    godown_srno: number;
    updtby: string;
    godown_desc: string;
}
