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
  usePandasAi: boolean = true;
  isAnalyzing = false;
  error: string | null = null;

  constructor(private analysisService: AnalysisService) {}

  onFileSelect(event: any) {
    if (this.isAnalyzing) return;
    const newFiles = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
  }

  removeFile(index: number) {
    if (this.isAnalyzing) return;
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
  }

  startAnalysis() {
    if (this.selectedFiles.length === 0) return;
    
    this.isAnalyzing = true;
    this.error = null;
    
    this.analysisService.startNewAnalysis(
      this.selectedFiles,
      this.apiKey,
      this.usePandasAi
    ).subscribe({
      next: () => {
        this.isAnalyzing = false;
      },
      error: (error) => {
        this.error = '分析初始化失败，请重试';
        this.isAnalyzing = false;
        console.error('分析失败:', error);
      }
    });
  }
}