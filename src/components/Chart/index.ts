import styles from "./Chart.module.css";

import registrations from "./registrations.json";

// IMport and register chartjs components
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
} from "chart.js";

ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip
)

class Chart extends HTMLElement {
  constructor() {
    super();
  }

  data = [...registrations];

  canvas = document.createElement("canvas");
  chart: ChartJS | null = null;

  // Create the chart when the element is connected to the DOM
  connectedCallback() {

    // The chart container
    this.innerHTML = `
      <div class="${styles["chart-container"]}"></div>
    `;

    // Canvas accessibility attributes
    this.canvas.id = "chart";
    this.canvas.ariaLabel = "Chart of event registrations per month";
    this.canvas.role = "img";

    // Update the chart colors to use CSS variables for easy transition to dark theme
    const updateChartColors = () => {
      // Add 0s delay for dark class to be toggled
      setTimeout(() => {
        // Get the correct element depneding on the current theme
        const rootStyles = getComputedStyle(
          document.body.classList.contains("dark")
          ? document.querySelector(".dark")!
          : document.querySelector(":root")!
        );
      
        // Update colors for the axes labels, bar, and ticks
        ChartJS.defaults.elements.bar.backgroundColor = rootStyles.getPropertyValue("--color-primary");
        this.chart!.options.scales!.x!.grid!.tickColor = rootStyles.getPropertyValue("--color-surface");
        this.chart!.options.scales!.y!.grid!.tickColor = rootStyles.getPropertyValue("--color-surface");
        this.chart!.options.scales!.x!.ticks!.color = rootStyles.getPropertyValue("--color-body-variant");
        this.chart!.options.scales!.y!.ticks!.color = rootStyles.getPropertyValue("--color-body-variant");
      
        // Update the chart
        this.chart!.update();
      }, 0);
    };
    
    // Initialize the chart and store it
    this.chart = new ChartJS(
      this.canvas,
      {
        type: 'bar',
        data: {
          labels: this.data.map(row => row.month),
          datasets: [{
            label: "Registrations this month",
            data: this.data.map(row => row.registrations),
          }],
        },
        options: { 
          maintainAspectRatio: false,
          scales: {
            x: {
              border: { dash: [3, 3] },
              grid: { color: "#E2E8F0", offset: false },
              max: 900,
              ticks: { font: { size: 10 } },
            },
            y: {
              border: { dash: [3, 3] },
              grid: { color: "#E2E8F0", offset: true },
              max: 900,
              ticks: { font: { size: 10 } },
            },
          },
          plugins: {
            legend: { display: false }
          },
        },
      }
    );
    
    // Update chart colors whenever dark mode is toggled
    document.querySelector("#darkmode-toggle")!.addEventListener("click", updateChartColors);
    
    // Update chart colors
    updateChartColors();

    this.querySelector("div")!.appendChild(this.canvas);
  }

  // Destroy chart and reset canvas context when element is removed from the DOM
  disconnectedCallback() {
    this.chart?.destroy();
    this.canvas.getContext("2d")?.reset();
  }
}

customElements.define("interactive-chart", Chart)

export default Chart;
