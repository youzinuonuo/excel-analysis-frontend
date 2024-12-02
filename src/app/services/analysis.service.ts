import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = 'http://localhost:8000/api';
  private chartDataSubject = new Subject<string>();
  chartData$ = this.chartDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  analyzeFiles(files: File[], query: string, apiKey: string, usePandasAi: boolean = true): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('query', query);
    formData.append('api_key', apiKey);
    formData.append('use_pandas_ai', usePandasAi.toString());

    return this.http.post(`${this.apiUrl}/analyze`, formData);
  }

  updateChartData(data: string) {
    this.chartDataSubject.next(data);
  }
}