import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  type: 'user' | 'response';
  text?: string;
  chartData?: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  chatHistory$ = this.chatHistorySubject.asObservable();
  private sessionId: string | null = null;

  constructor(private http: HttpClient) {}

  startNewAnalysis(formData: FormData, apiKey: string): Observable<any> {
    return new Observable(observer => {
      this.http.post<{session_id: string, dataframes: any}>('/api/start-analysis', formData).subscribe({
        next: (response) => {
          this.sessionId = response.session_id;
          this.chatHistorySubject.next([]);
          
          if (response.dataframes) {
            const dataframeInfo = this.formatDataframeInfo(response.dataframes);
            this.addMessage({
              type: 'response',
              text: dataframeInfo,
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

  private formatDataframeInfo(dataframes: { [key: string]: any }): string {
    let info = '已加载的数据表：\n\n';
    for (const [name, data] of Object.entries(dataframes)) {
      info += `表名：${name}\n`;
      if (data) {
        const columns = Object.keys(data);
        info += `列：${columns.join(', ')}\n`;
        info += `预览数据：\n${JSON.stringify(data, null, 2)}\n\n`;
      }
    }
    return info;
  }

  analyzeQuery(query: string): Observable<any> {
    if (!this.sessionId) {
      throw new Error('No active analysis session');
    }

    this.addMessage({
      type: 'user',
      text: query,
      timestamp: new Date()
    });

    return new Observable(observer => {
      this.http.post<any>('/api/query', {
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