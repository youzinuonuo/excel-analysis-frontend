import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalysisService, ChatMessage } from '../../services/analysis.service';

@Component({
  selector: 'app-chart-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.css']
})
export class ChartDisplayComponent implements OnInit {
  chatHistory: ChatMessage[] = [];
  isLoading = false;
  error: string | null = null;
  query: string = '';

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.analysisService.chatHistory$.subscribe({
      next: (history) => {
        this.chatHistory = history;
        this.scrollToBottom();
      }
    });
  }

  onSendQuery() {
    if (!this.query.trim()) return;
  
    this.isLoading = true;
    this.error = null;
    
    this.analysisService.analyzeQuery(this.query).subscribe({
      next: () => {
        this.query = '';
        this.isLoading = false;
      },
      error: (error) => {
        this.error = '分析失败，请重试';
        this.isLoading = false;
        console.error('分析失败:', error);
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const messagesDiv = document.querySelector('.messages');
      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    });
  }
}