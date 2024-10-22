import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js/auto";

import { getRelativePosition } from "chart.js/helpers";

class Chart extends HTMLElement {
  constructor() {
    super();
  }

  data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  chart = document.createElement("canvas");

  connectedCallback() {

    this.innerHTML = `
      <div width="800px"></div>
    `;
  
    new ChartJS(
      this.chart,
      {
        type: 'bar',
        data: {
          labels: this.data.map(row => row.year),
          datasets: [
            {
              label: 'Acquisitions by year',
              data: this.data.map(row => row.count)
            }
          ]
        }
      }
    );

    this.querySelector("div")!.appendChild(this.chart);
  }
}

customElements.define("interactive-chart", Chart)

export default Chart;
