import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [],
  templateUrl: './category-chart.component.html',
})
export class CategoryChartComponent implements AfterViewInit {
  @ViewChild('categoryChart') private chartRef!: ElementRef;
  chart!: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Roupas', 'Beleza', 'Supermercado'],
        datasets: [{
          label: 'Vendas por Categoria',
          data: [120500, 85600, 98900],
          backgroundColor: ['#14B8A6', '#3B82F6', '#F59E0B'],
          borderColor: '#FFFFFF',
          borderWidth: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12,
              font: { family: "'Inter', sans-serif" }
            }
          }
        }
      }
    });
  }
}