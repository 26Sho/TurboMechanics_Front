import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-estimate-response',
  templateUrl: './estimate-response.component.html',
  styleUrls: ['./estimate-response.component.scss']
})
export class EstimateResponseComponent implements OnInit {

  token:    string | null = null;
  estimate: any           = null;
  loading   = true;
  error     = false;
  responded = false;
  decision: 'APPROVED' | 'REJECTED' | null = null;
  responding = false;

  private readonly apiUrl = 'http://10.5.154.188:9090/presupuestos/publico'; // ← IP actualizada

  constructor(
    private route: ActivatedRoute,
    private http:  HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.error   = true;
      this.loading = false;
      return;
    }
    this.loadEstimate();
  }

  loadEstimate(): void {
    this.http.get<any>(`${this.apiUrl}?token=${this.token}`).subscribe({
      next: (data) => {
        this.estimate = data;
        this.loading  = false;
        if (data.statusEstimate !== 'SENT') {
          this.responded = true;
          this.decision  = data.statusEstimate;
        }
      },
      error: () => {
        this.error   = true;
        this.loading = false;
      }
    });
  }

  respond(approved: boolean): void {
    if (this.responding) return;
    this.responding = true;

    this.http.patch<any>(
      `${this.apiUrl}/respuesta?token=${this.token}&approved=${approved}`, {}
    ).subscribe({
      next: (data) => {
        this.estimate  = data;
        this.responded = true;
        this.decision  = approved ? 'APPROVED' : 'REJECTED';
        this.responding = false;
      },
      error: () => {
        this.responding = false;
      }
    });
  }
}