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
  private sessionId: string | null = null;

  constructor(private http: HttpClient) {}

  startNewAnalysis(files: File[], apiKey: string, usePandasAi: boolean): Observable<AnalysisResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('api_key', apiKey);
    formData.append('use_pandas_ai', String(usePandasAi));
    formData.append('query', '请分析这些数据文件的基本情况');

    return new Observable<AnalysisResponse>(observer => {
      this.http.post<{session_id: string} & AnalysisResponse>('/api/start-analysis', formData).subscribe({
        next: (response) => {
          this.sessionId = response.session_id;
          this.chatHistorySubject.next([]);
          
          if (response.text || response.chart_data) {
            this.addMessage({
              type: 'response',
              text: response.text,
              chartData: response.chart_data,
              timestamp: new Date()
            });
          }
          
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  analyzeQuery(query: string): Observable<AnalysisResponse> {
    if (!this.sessionId) {
      throw new Error('No active analysis session');
    }

    this.addMessage({
      type: 'user',
      text: query,
      timestamp: new Date()
    });

    return new Observable<AnalysisResponse>(observer => {
      this.http.post<AnalysisResponse>('/api/query', {
        session_id: this.sessionId,
        query
      }).subscribe({
        next: (response) => {
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