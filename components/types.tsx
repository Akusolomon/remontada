

// export interface FrontendAuditLog {
//   entityId: string;
//   _id: string;
//   entityType: string;
//   entityName: string;
//   description: string;
//   recordId: string;
//   action: string;
//   performedBy: any;
//   performedById: string;
//   timestamp: Date;
//   createdAt: Date;
//   changes: AuditChange[];
//   before: any;
//   after: any;
// }

// export interface AuditChange {
//   field: string;
//   oldValue: any;
//   newValue: any;
// }
// // types/audit.ts
export interface BackendAuditLog {
  _id?: string;
  id?: string;
  entity: string;
  entityId: any;
  action: string;
  performedBy: any; // This can be string (ID) or object (populated)
  createdAt: Date;
  before?: any;
  after?: any;
  timestamp?: Date;
  __v?: number;
}

// export interface PopulatedUser {
//   _id: string;
//   name: string;
//   email?: string;
//   id?: string;
// }

export interface FrontendAuditLog {
  _id: string;
  entity: string;
  entityId: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    id: string;
  };
  before?: any;
  after?: any;
  createdAt: string;
  __v?: number;
  // Optional fields that might exist
  changes?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}