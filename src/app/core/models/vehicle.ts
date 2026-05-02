export interface VehicleRequest {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  ownerId: number;
}

export interface VehicleResponse {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color?: string;
  ownerId: number;
  ownerName: string;
  ownerIdentification: number;
  ownerPhone: string;
  ownerEmail: string;
  associationDate: string;
}

export interface AssociateOwnerRequest {
  ownerId: number;
}

export interface UserResponse {
  id: number;
  username: string;
  identification: number;
  phone: string;
  email: string;
  rolId: number;
}
