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
  tableNames: string[] = [];
  apiKey: string = '';
  isAnalyzing = false;
  error: string | null = null;

  constructor(private analysisService: AnalysisService) {}

  onFileSelect(event: any) {
    if (this.isAnalyzing) return;
    const newFiles = Array.from(event.target.files) as File[];
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    newFiles.forEach(file => {
      const defaultTableName = file.name.replace(/\.[^/.]+$/, "");
      this.tableNames.push(defaultTableName);
    });
  }

  removeFile(index: number) {
    if (this.isAnalyzing) return;
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.tableNames = this.tableNames.filter((_, i) => i !== index);
  }

  startAnalysis() {
    if (this.selectedFiles.length === 0) return;
    
    this.isAnalyzing = true;
    this.error = null;
    
    const formData = new FormData();
    this.selectedFiles.forEach((file, index) => {
      formData.append(`files`, file);
      formData.append(`table_names`, this.tableNames[index] || '');
    });
    formData.append('api_key', this.apiKey);
    
    this.analysisService.startNewAnalysis(
      formData,
      this.apiKey
    ).subscribe({
      next: (response) => {
        this.isAnalyzing = false;
        console.log('分析结果:', response);
      },
      error: (error) => {
        this.error = '分析初始化失败，请重试';
        this.isAnalyzing = false;
        console.error('分析失败:', error);
      }
    });
  }
}