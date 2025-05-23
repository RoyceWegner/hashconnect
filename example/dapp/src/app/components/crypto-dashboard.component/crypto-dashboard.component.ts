import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-crypto-dashboard',
  templateUrl: './crypto-dashboard.component.html',
  styleUrls: ['./crypto-dashboard.component.css']
})
export class CryptoDashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // Example: Draw a chart
    new Chart('myChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{
          label: 'HBAR Price',
          data: [0.08, 0.09, 0.085, 0.095],
          borderColor: 'blue',
          fill: false
        }]
      }
    });

    // Fetch and display data logic here (CoinGecko, DexScreener, etc.)
  }
}
