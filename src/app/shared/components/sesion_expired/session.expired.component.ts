import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionExpiredService } from '../../../core/services/session.expired.service';

@Component({
  selector: 'app-session-expired',
  templateUrl: './session.expired.component.html',
  styleUrls: ['./session.expired.component.scss']
})
export class SessionExpiredComponent implements OnInit, OnDestroy {
  visible = false;
  private sub!: Subscription;

  constructor(
    private sessionExpiredService: SessionExpiredService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.sessionExpiredService.isVisible$.subscribe(v => this.visible = v);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goToLogin(): void {
    this.sessionExpiredService.hide();
    this.router.navigate(['/login']);
  }
}
