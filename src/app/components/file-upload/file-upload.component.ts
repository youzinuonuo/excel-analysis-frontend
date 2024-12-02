import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  selectedFiles: File[] = [];
  apiKey: string = '';
  query: string = '';
  usePandasAi: boolean = true;

  constructor(private analysisService: AnalysisService) {}

  onFileSelect(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onAnalyze() {
    if (this.selectedFiles.length === 0) {
      alert('请选择文件');
      return;
    }

    this.analysisService.analyzeFiles(
      this.selectedFiles, 
      this.query, 
      this.apiKey,
      this.usePandasAi
    ).subscribe({
      next: (response) => {
        this.analysisService.updateChartData(response.chart_data);
      },
      error: (error) => {
        console.error('分析失败:', error);
        alert('分析失败，请重试');
      }
    });
  }
}