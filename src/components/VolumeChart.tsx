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

// Chart.jsに必要なコンポーネントを登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

/**
 * 総負荷量グラフコンポーネント
 * 
 * Chart.jsのLineチャートを使用して、トレーニングの総負荷量を可視化します。
 * 日別、週別、月別のデータをグラフ表示できます。
 */

type Props = {
  /** グラフデータ（ラベルと総負荷量の配列） */
  data: { label: string; volume: number }[]
  /** グラフのタイトル */
  title: string
}

export default function VolumeChart({ data, title }: Props) {
  // Chart.jsのデータ構造を作成
  const chartData = {
    // X軸のラベル（日付、週、月など）
    labels: data.map(d => d.label),
    datasets: [
      {
        label: '総負荷量 (kg)',
        // Y軸のデータ（総負荷量）
        data: data.map(d => d.volume),
        // 線の色（青）
        borderColor: '#3b82f6',
        // 線の下の塗りつぶし色（薄い青、半透明）
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        // 線の滑らかさ（0.3で適度なカーブ）
        tension: 0.3,
      },
    ],
  }

  // Chart.jsのオプション設定
  const options = {
    // レスポンシブ表示を有効化
    responsive: true,
    plugins: {
      // グラフタイトルを表示
      title: { display: true, text: title },
    },
    scales: {
      // Y軸の設定
      y: {
        // 0から始める
        beginAtZero: true,
        title: { display: true, text: 'kg' },
      },
      // X軸の設定
      x: {
        title: { display: true, text: '期間' },
      },
    },
  }

  return <Line data={chartData} options={options} />
}
