<template>
  <div class="container grafico">
    <h4>Seguidores</h4>
  
    <line-chart v-if="count > 1" :chartdata="chartdata" :options="options"/>
    <p v-else>Nenhum histórico de consultas</p>

  </div>
</template>

<script>
import LineChart from './Chart.vue'

export default {
  name: 'LineChartContainer',
  components: { LineChart },
  data: () => ({
    loaded: false,
    chartdata: null,
    count: null
  }),
  async mounted () {
    this.loaded = true // false
    try {
        const dados = JSON.parse(localStorage.getItem('vue-facebook-login-accounts'))
        const chartData = dados.instagramData.followers
        this.count = chartData.length
        let labelsArray = []
        let dataArray = []
        chartData.forEach(item => {
            labelsArray.push(item.date)
            dataArray.push(item.qtt)
        });
        //   const { userlist } = await fetch('/api/userlist')
        let userList = {
            labels: labelsArray,
            datasets: [{
                label: 'Seguidores',
                backgroundColor: 'royalblue',
                showLines: false,
                data: dataArray
            }]
        }
        this.chartdata = userList
        this.options = {
            legend: { display: false },
            responsive: true,
            maintainAspectRatio: false,
            scales:{
                xAxes: [{ display: false }],
                yAxes: [{ display: false }],
            }
        }
        this.loaded = true
    } catch (e) {
        console.error(e)
    }
  }
}
</script>

<style>
    .grafico {
        margin-bottom: 10px;
    }
</style>