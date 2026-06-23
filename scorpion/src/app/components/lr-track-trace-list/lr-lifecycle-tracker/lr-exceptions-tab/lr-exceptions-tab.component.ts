import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DepsTicket {
  type: 'SHORTAGE' | 'DAMAGE' | 'EXCESS' | 'PILFERAGE';
  id: string;
  raisedOn: string;
  raisedAt: string;
  raisedBy: string;
  pkgsAffected: string;
  weightAffected: string;
  description: string;
  closed: boolean;
  closedOn?: string;
  closureRemarks?: string;
  icon: string;
}

@Component({
  selector: 'app-lr-exceptions-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lr-exceptions-tab.component.html',
  styles: []
})
export class LrExceptionsTabComponent {
  @Input() lrDetails: any;

  public tickets: DepsTicket[] = [
    {
      type: 'SHORTAGE',
      id: 'DEPS/BLR001/2526/000031',
      raisedOn: '13 Apr 2026, 08:40 AM',
      raisedAt: 'Chennai Hub (MAA-HUB)',
      raisedBy: 'USR-HUB-MAA-002 : Ravi Kumar',
      pkgsAffected: '1 Pkg(s)',
      weightAffected: '35 kg',
      description: '1 wooden crate missing on arrival at MAA-HUB. Manifest shows 6 pkgs, received 5.',
      closed: true,
      closedOn: '13 Apr 2026, 10:00 AM',
      closureRemarks: 'Traced and loaded on next vehicle. Delivered with main consignment.',
      icon: '⚖️'
    }
  ];
}
