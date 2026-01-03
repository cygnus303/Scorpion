
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ApiLoadingService } from '../services/APILoading.service';
 
export const apiLoadingInterceptor: HttpInterceptorFn = (req, next) => {
 const apiLoading = inject(ApiLoadingService);
 
 if (req.headers.get('skipLoader') === 'true') {
    return next(req);
 }
 
 apiLoading.start();
 
 return next(req).pipe(
    finalize(() => apiLoading.stop())
 );
};
 