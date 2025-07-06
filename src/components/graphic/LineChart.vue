<template>
  <div class="bar-graphs">
    <h5>{{ chartTitle }}</h5>
    <canvas ref="barChart" style="height: 470px"></canvas>
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'LineChartComponent',
  props: {
    chartData: {
      type: Array,
      required: true
    },
    chartTitle: {
      type: String,
      default: 'Графік'
    }
  },
  setup(props) {
    const barChart = ref(null);
    let chartInstance = null;

    const renderChart = () => {
      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(barChart.value, {
        type: 'bar',
        data: {
          labels: props.chartData.map(item => item.label),
          datasets: props.chartData.map(item => ({
            label: item.label,
            data: item.data,
            backgroundColor: item.backgroundColor,
            barPercentage: 1, // 🔵 Ширина блоку
            categoryPercentage: 1, // 🔵 Рівномірне розміщення
            borderWidth: 0.1,
          }))
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                font: {
                  family: 'Nunito',
                  size: 14
                }
              }
            }
          },
          scales: {
            x: {
              stacked: false,
              ticks: {
                display: false
              },
              grid: {
                offset: false // 📏 Центрує сітку під кожен блок
              },
              // Розширення ширини стовпців
              categoryPercentage: 1, // Збільшує ширину категорії (0.8 = 80%)
              barPercentage: 1       // Збільшує ширину стовпців (0.9 = 90%)
            },
            y: {
              beginAtZero: true,
              grid: {
                display: true
              }
            }
          }
        }
      });
    };

    onMounted(renderChart);

    watch(() => props.chartData, renderChart);

    return {barChart};
  }
};
</script>
