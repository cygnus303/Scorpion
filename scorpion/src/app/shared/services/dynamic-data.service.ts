import { Inject, Injectable } from '@angular/core';
import { ApiHandlerService } from './api-handler.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DynamicDataService {
  constructor(@Inject(ApiHandlerService) private apiHandlerService: ApiHandlerService) { }

  getDynamicData(payload: any): Observable<any> {
    return this.apiHandlerService.Post(`Operation/GetDynamicData`, payload);
  }

  getDynamicDataList(payload: any): Observable<any[]> {
    return this.getDynamicData(payload).pipe(
      map((res: any) => {
        return (res && res.success && res.data && res.data.Table1) || (res && res.Table1) || [];
      })
    );
  }

}
