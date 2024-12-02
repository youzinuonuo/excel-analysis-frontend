import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisService } from '../../services/analysis.service';

@Component({
  selector: 'app-chart-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-display.component.html',
  styleUrls: ['./chart-display.component.css']
})
export class ChartDisplayComponent implements OnInit {
  chartData: string | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private analysisService: AnalysisService) {}

  ngOnInit() {
    this.analysisService.chartData$.subscribe({
      next: (data) => {
        this.chartData = data;
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = '图表生成失败，请重试';
        this.isLoading = false;
      }
    });
  }
}