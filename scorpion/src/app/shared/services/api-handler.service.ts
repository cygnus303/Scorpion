import { Injectable } from '@angular/core';
import { IApiBaseResponse, ParamsType } from '../interface/api-base-action-response';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, map, Observable, tap } from 'rxjs';
import { ResponseMessages } from '../constants/response-message';
import { ApiLoadingService } from './APILoading.service';

@Injectable({
  providedIn: 'root'
})
export class ApiHandlerService {
constructor(public httpClient: HttpClient,private apiLoading: ApiLoadingService) {}

  Get(url: string, params?: ParamsType) {
    return this.httpClient.get<IApiBaseResponse<any>>(environment.apiUrl + url, { params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  GetLoad<T>(url: string, paramsObj?: any): Observable<IApiBaseResponse<T>> {
    this.apiLoading.start(); // start loader

    let params = new HttpParams();
    if (paramsObj) {
      Object.keys(paramsObj).forEach(key => {
        if (paramsObj[key] !== null && paramsObj[key] !== undefined) {
          params = params.set(key, paramsObj[key]);
        }
      });
    }

    return this.httpClient.get<IApiBaseResponse<T>>(environment.apiUrl + url, { params }).pipe(
      tap(x => this.HandleResponse?.(x)), // your existing tap
      finalize(() => this.apiLoading.stop()) // stop loader automatically
    );
  }

  PostLoad<T>(url: string, body: any): Observable<IApiBaseResponse<T>> {
    this.apiLoading.start();

    return this.httpClient.post<IApiBaseResponse<T>>(environment.apiUrl + url, body).pipe(
      tap(x => this.HandleResponse?.(x)),
      finalize(() => this.apiLoading.stop())
    );
  }

  GetAll(url: string, params?: ParamsType) {
    return this.httpClient.get<IApiBaseResponse<any>>(environment.apiUrl + url, { params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  Post(url: string, data: any, params?: ParamsType, headers?: HttpHeaders) {

    return this.httpClient.post<IApiBaseResponse<any>>(environment.apiUrl + url, data, { headers: headers, params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  Delete(url: string, params?: ParamsType) {
    return this.httpClient.delete<IApiBaseResponse<any>>(environment.apiUrl + url, { params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  Put(url: string, data?: any, params?: ParamsType) {
    return this.httpClient.put<IApiBaseResponse<any>>(environment.apiUrl + url, data, { params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  Patch(url: string, data?: any, params?: ParamsType) {
    return this.httpClient.patch<IApiBaseResponse<any>>(environment.apiUrl + url, data, { params: this.createParams(params) }).pipe(tap(x => this.HandleResponse(x)));
  }

  HandleResponse(response: any) {
    if (response.Status === 500) {
      alert(ResponseMessages.serverError);
    }
  }

  createParams(params?: any) {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.append(key, value as string | number | boolean);
      });
    }
    return httpParams;
  }
  DownloadFile(url: string): Observable<Blob> {
    return this.httpClient.get<Blob>(environment.apiUrl + url, {responseType: 'blob' as 'json'});
  }
}
