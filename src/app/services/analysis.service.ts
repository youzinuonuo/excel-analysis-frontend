import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  type: 'user' | 'response';
  text?: string;
  chartData?: string;
  timestamp: Date;
}

export interface AnalysisResponse {
  text?: string;
  chart_data?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  chatHistory$ = this.chatHistorySubject.asObservable();

  constructor(private http: HttpClient) {}

  analyzeFiles(files: File[], query: string, apiKey: string, usePandasAi: boolean): Observable<AnalysisResponse> {
    this.addMessage({
      type: 'user',
      text: query,
      timestamp: new Date()
    });

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('query', query);
    formData.append('api_key', apiKey);
    formData.append('use_pandas_ai', String(usePandasAi));

    return new Observable<AnalysisResponse>(observer => {
      this.http.post<AnalysisResponse>('/api/analyze', formData).subscribe({
        next: (response: AnalysisResponse) => {
          this.addMessage({
            type: 'response',
            text: response.text,
            chartData: response.chart_data,
            timestamp: new Date()
          });
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  private addMessage(message: ChatMessage) {
    const currentHistory = this.chatHistorySubject.value;
    this.chatHistorySubject.next([...currentHistory, message]);
  }
}