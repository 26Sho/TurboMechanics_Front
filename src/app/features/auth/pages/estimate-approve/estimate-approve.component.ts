import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
@Component({
  standalone: false,
  selector: 'app-estimate-approve',
  templateUrl: './estimate-approve.component.html',
  styleUrls: ['./estimate-approve.component.scss']
})
export class EstimateApproveComponent implements OnInit {

  loading   = true;
  error     = false;
  success   = false;
  alreadyResponded = false;

  private readonly apiUrl = `${environment.apiUrl}/presupuestos`;

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
      `${this.apiUrl}/response?token=${token}&accion=aprobar`, {}
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