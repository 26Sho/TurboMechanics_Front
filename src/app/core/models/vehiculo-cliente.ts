export interface VehiculoClienteRequest {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  tipo?: string;
  cilindraje?: string;
}

export interface VehiculoClienteResponse {
  id: number;
  usuarioId: number;
  nombreUsuario?: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color?: string;
  tipo?: string;
  cilindraje?: string;
  fechaRegistro: string;
}