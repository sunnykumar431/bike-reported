import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseURL = environment.apiEndpoint;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  getIncidents(searchKey): Observable<any> {
    const payloadURL = `${this.baseURL}incidents?${searchKey}`;
    return this.http.get(payloadURL, this.httpOptions).pipe(
      catchError(this.handleError('getIncidents', null))
    );
  }

  getIncidentDetails(incidentId): Observable<any> {
    const payloadURL = `${this.baseURL}incidents/${incidentId}`;
    return this.http.get(payloadURL, this.httpOptions).pipe(
      catchError(this.handleError('getIcidentDetails', null))
    );
  }

  getAddressGeoCoding(address): Observable<any> {
    const payloadURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyD1ccpCwWf9izG6tyHNaeuYCN7vOf90ZQA`;
    return this.http.get(payloadURL).pipe(
      catchError(this.handleError('getAddressGeoCoding', null))
    );
  }
  JSONP_CALLBACK(data) {
    console.log(data);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(error as any);
    };
  }
}
