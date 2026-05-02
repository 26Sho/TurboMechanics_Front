import { Component, OnInit } from '@angular/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { VehicleService } from 'src/app/core/services/vehicle.service';
import { AssociateOwnerRequest, UserResponse, VehicleRequest, VehicleResponse } from 'src/app/core/models/vehicle';

type Tab = 'registrar' | 'lista' | 'asociar';

@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss',
})
export class VehicleComponent implements OnInit {

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab: Tab = 'registrar';

  // ── Form: Registrar vehículo ──────────────────────────────────────────────
  plate = '';
  brand = '';
  model = '';
  year: number | null = null;
  color = '';
  ownerSearch = '';
  selectedOwnerId: number | null = null;
  selectedOwnerName = '';
  ownerResults: UserResponse[] = [];
  ownerSearched = false;
  ownerNotFound = false;

  // ── Form: Asociar propietario ─────────────────────────────────────────────
  assocPlate = '';
  assocVehicle: VehicleResponse | null = null;
  assocVehicleNotFound = false;
  assocVehicleSearched = false;

  assocOwnerSearch = '';
  assocOwnerResults: UserResponse[] = [];
  assocOwnerSearched = false;
  assocOwnerNotFound = false;
  assocSelectedOwnerId: number | null = null;
  assocSelectedOwnerName = '';

  assocSuccess = false;
  assocUpdatedVehicle: VehicleResponse | null = null;

  // ── Lista ─────────────────────────────────────────────────────────────────
  vehicles: VehicleResponse[] = [];
  filterPlate = '';
  filterOwner = '';

  // ── State ─────────────────────────────────────────────────────────────────
  isLoading = false;

  // ── Detail modal ──────────────────────────────────────────────────────────
  showDetail = false;
  detailVehicle: VehicleResponse | null = null;

  constructor(
    private vehicleService: VehicleService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {}

  // ── Tabs ──────────────────────────────────────────────────────────────────
  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'lista') this.loadVehicles();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: REGISTRAR
  // ═══════════════════════════════════════════════════════════════════════════

  searchOwnerForRegister(): void {
    const q = this.ownerSearch.trim();
    if (!q) { this.toastService.warning('Ingresa un nombre, cédula o correo para buscar'); return; }
    this.isLoading = true;
    this.ownerResults = [];
    this.ownerSearched = false;
    this.ownerNotFound = false;

    this.vehicleService.getAllUsers().subscribe({
      next: (users) => {
        this.isLoading = false;
        this.ownerSearched = true;
        const lower = q.toLowerCase();
        this.ownerResults = users.filter(u =>
          u.username.toLowerCase().includes(lower) ||
          String(u.identification).includes(lower) ||
          u.email.toLowerCase().includes(lower)
        );
        this.ownerNotFound = this.ownerResults.length === 0;
      },
      error: () => {
        this.isLoading = false;
        this.ownerSearched = true;
        this.ownerNotFound = true;
        this.toastService.error('Error al buscar clientes');
      }
    });
  }

  selectOwner(user: UserResponse): void {
    this.selectedOwnerId = user.id;
    this.selectedOwnerName = `${user.username} — Cédula: ${user.identification}`;
    this.ownerResults = [];
  }

  clearOwnerSelection(): void {
    this.selectedOwnerId = null;
    this.selectedOwnerName = '';
    this.ownerSearch = '';
    this.ownerSearched = false;
    this.ownerResults = [];
    this.ownerNotFound = false;
  }

  submitVehicle(): void {
    if (!this.plate.trim())         { this.toastService.warning('La placa es obligatoria'); return; }
    if (!this.brand.trim())         { this.toastService.warning('La marca es obligatoria'); return; }
    if (!this.model.trim())         { this.toastService.warning('El modelo es obligatorio'); return; }
    if (!this.year)                 { this.toastService.warning('El año es obligatorio'); return; }
    if (!this.selectedOwnerId)      { this.toastService.warning('Debes seleccionar un propietario'); return; }

    const payload: VehicleRequest = {
      plate: this.plate.trim().toUpperCase(),
      brand: this.brand.trim(),
      model: this.model.trim(),
      year: this.year,
      color: this.color.trim() || undefined,
      ownerId: this.selectedOwnerId,
    };

    this.isLoading = true;
    this.vehicleService.create(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(`Vehículo ${res.plate} registrado exitosamente`);
        this.clearRegisterForm();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Error al registrar el vehículo');
      }
    });
  }

  clearRegisterForm(): void {
    this.plate = '';
    this.brand = '';
    this.model = '';
    this.year = null;
    this.color = '';
    this.ownerSearch = '';
    this.selectedOwnerId = null;
    this.selectedOwnerName = '';
    this.ownerResults = [];
    this.ownerSearched = false;
    this.ownerNotFound = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: ASOCIAR PROPIETARIO
  // ═══════════════════════════════════════════════════════════════════════════

  searchVehicleByPlate(): void {
    const plate = this.assocPlate.trim().toUpperCase();
    if (!plate) { this.toastService.warning('Ingresa una placa'); return; }
    this.isLoading = true;
    this.assocVehicle = null;
    this.assocVehicleSearched = false;
    this.assocVehicleNotFound = false;
    this.assocSuccess = false;
    this.clearAssocOwnerSelection();

    this.vehicleService.getByPlate(plate).subscribe({
      next: (v) => {
        this.isLoading = false;
        this.assocVehicle = v;
        this.assocVehicleSearched = true;
      },
      error: () => {
        this.isLoading = false;
        this.assocVehicleSearched = true;
        this.assocVehicleNotFound = true;
        this.toastService.error('Vehículo no encontrado');
      }
    });
  }

  searchOwnerForAssoc(): void {
    const q = this.assocOwnerSearch.trim();
    if (!q) { this.toastService.warning('Ingresa un nombre, cédula o correo para buscar'); return; }
    this.isLoading = true;
    this.assocOwnerResults = [];
    this.assocOwnerSearched = false;
    this.assocOwnerNotFound = false;

    this.vehicleService.getAllUsers().subscribe({
      next: (users) => {
        this.isLoading = false;
        this.assocOwnerSearched = true;
        const lower = q.toLowerCase();
        this.assocOwnerResults = users.filter(u =>
          u.username.toLowerCase().includes(lower) ||
          String(u.identification).includes(lower) ||
          u.email.toLowerCase().includes(lower)
        );
        this.assocOwnerNotFound = this.assocOwnerResults.length === 0;
      },
      error: () => {
        this.isLoading = false;
        this.assocOwnerSearched = true;
        this.assocOwnerNotFound = true;
        this.toastService.error('Error al buscar clientes');
      }
    });
  }

  selectAssocOwner(user: UserResponse): void {
    this.assocSelectedOwnerId = user.id;
    this.assocSelectedOwnerName = `${user.username} — Cédula: ${user.identification}`;
    this.assocOwnerResults = [];
  }

  clearAssocOwnerSelection(): void {
    this.assocSelectedOwnerId = null;
    this.assocSelectedOwnerName = '';
    this.assocOwnerSearch = '';
    this.assocOwnerSearched = false;
    this.assocOwnerResults = [];
    this.assocOwnerNotFound = false;
  }

  submitAssociation(): void {
    if (!this.assocVehicle)           { this.toastService.warning('Busca un vehículo primero'); return; }
    if (!this.assocSelectedOwnerId)   { this.toastService.warning('Selecciona un nuevo propietario'); return; }
    if (this.assocSelectedOwnerId === this.assocVehicle.ownerId) {
      this.toastService.warning('Este cliente ya es el propietario del vehículo');
      return;
    }

    const payload: AssociateOwnerRequest = { ownerId: this.assocSelectedOwnerId };

    this.isLoading = true;
    this.vehicleService.updateOwner(this.assocVehicle.id, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.assocUpdatedVehicle = res;
        this.assocSuccess = true;
        this.toastService.success('Propietario actualizado exitosamente');
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Error al actualizar el propietario');
      }
    });
  }

  resetAssocForm(): void {
    this.assocPlate = '';
    this.assocVehicle = null;
    this.assocVehicleNotFound = false;
    this.assocVehicleSearched = false;
    this.assocSuccess = false;
    this.assocUpdatedVehicle = null;
    this.clearAssocOwnerSelection();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TAB: LISTA
  // ═══════════════════════════════════════════════════════════════════════════

  loadVehicles(): void {
    this.isLoading = true;
    this.vehicleService.list().subscribe({
      next: (res) => { this.isLoading = false; this.vehicles = res; },
      error: (err) => { this.isLoading = false; this.toastService.error(err.error?.message || 'Error al cargar vehículos'); }
    });
  }

  get filteredVehicles(): VehicleResponse[] {
    let result = this.vehicles;
    if (this.filterPlate.trim()) {
      result = result.filter(v => v.plate.toLowerCase().includes(this.filterPlate.trim().toLowerCase()));
    }
    if (this.filterOwner.trim()) {
      result = result.filter(v => v.ownerName.toLowerCase().includes(this.filterOwner.trim().toLowerCase()) ||
        String(v.ownerIdentification).includes(this.filterOwner.trim()));
    }
    return result;
  }

  // ── Detail modal ──────────────────────────────────────────────────────────
  openDetail(v: VehicleResponse): void {
    this.detailVehicle = v;
    this.showDetail = true;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detailVehicle = null;
  }
}
