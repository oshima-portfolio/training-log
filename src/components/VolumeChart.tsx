'use client'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

type Props = {
  data: { label: string; volume: number }[]
  title: string
}

export default function VolumeChart({ data, title }: Props) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: '総負荷量 (kg)',
        data: data.map(d => d.volume),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: title },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'kg' },
      },
      x: {
        title: { display: true, text: '期間' },
      },
    },
  }

  return <Line data={chartData} options={options} />
}
