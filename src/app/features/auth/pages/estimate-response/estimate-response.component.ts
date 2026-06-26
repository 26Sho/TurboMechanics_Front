import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-estimate-response',
  templateUrl: './estimate-response.component.html',
  styleUrls: ['./estimate-response.component.scss']
})
export class EstimateResponseComponent implements OnInit {

  token: string | null = null;
  action: string | null = null;

  estimate: any = null;

  loading = true;
  error = false;

  responded = false;

  decision: 'APPROVED' | 'REJECTED' | null = null;

  private readonly apiUrl =
    'http://localhost:9090/presupuestos/publico';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    // LEER PARAMS
    this.token = this.route.snapshot.paramMap.get('token');
    this.action = this.route.snapshot.paramMap.get('accion');

    console.log('TOKEN:', this.token);
    console.log('ACTION:', this.action);

    if (!this.token || !this.action) {

      this.error = true;
      this.loading = false;

      return;
    }

    // CARGAR PRESUPUESTO
    this.loadEstimate();
  }

  loadEstimate(): void {

    this.http.get<any>(
      `${this.apiUrl}?token=${this.token}`
    ).subscribe({

      next: (data) => {

        this.estimate = data;

        // SI YA RESPONDIÓ
        if (data.statusEstimate !== 'SENT') {

          this.responded = true;

          this.decision = data.statusEstimate;

          this.loading = false;

          return;
        }

        // EJECUTAR ACCIÓN AUTOMÁTICAMENTE
        if (this.action === 'aprobar') {

          this.respond(true);

        } else if (this.action === 'rechazar') {

          this.respond(false);

        } else {

          this.error = true;
          this.loading = false;

        }

      },

      error: () => {

        this.error = true;
        this.loading = false;

      }

    });
  }

  respond(approved: boolean): void {

    this.http.patch<any>(
      `${this.apiUrl}/respuesta?token=${this.token}&approved=${approved}`,
      {}
    ).subscribe({

      next: (data) => {

        this.estimate = data;

        this.responded = true;

        this.decision =
          approved
            ? 'APPROVED'
            : 'REJECTED';

        this.loading = false;

      },

      error: () => {

        this.error = true;
        this.loading = false;

      }

    });
  }

}