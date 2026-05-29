import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-estimate-reject',
  templateUrl: './estimate-reject.component.html',
  styleUrls: ['./estimate-reject.component.scss']
})
export class EstimateRejectComponent implements OnInit {

  loading  = true;
  error    = false;
  success  = false;
  alreadyResponded = false;

  private readonly apiUrl = 'http://localhost:9090/presupuestos';

  constructor(
    private route: ActivatedRoute,
    private http:  HttpClient
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error   = true;
      this.loading = false;
      return;
    }

    this.http.patch<any>(
      `${this.apiUrl}/response?token=${token}&accion=rechazar`, {}
    ).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 409 || err.error?.message?.includes('respondido')) {
          this.alreadyResponded = true;
        } else {
          this.error = true;
        }
        this.loading = false;
      }
    });
  }
}