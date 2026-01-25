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
import type { ChartDataPoint, ChartType } from '@/types/types'

// Chart.jsに必要なコンポーネントを登録
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

/**
 * 汎用グラフコンポーネント
 * 
 * Chart.jsのLineチャートを使用して、トレーニングデータを可視化します。
 * グラフタイプに応じて総負荷量、最大重量、推定1RM、セット数を表示できます。
 */

type Props = {
  /** グラフデータ（ラベルと値の配列） */
  data: ChartDataPoint[]
  /** グラフタイプ */
  chartType: ChartType
}

/**
 * グラフタイプに応じたラベルと単位を取得
 */
const getChartConfig = (chartType: ChartType): { label: string; unit: string; color: string } => {
  switch (chartType) {
    case 'volume':
      return { label: '総負荷量', unit: 'kg', color: '#3b82f6' }
    case 'maxWeight':
      return { label: '最大重量', unit: 'kg', color: '#ef4444' }
    case 'estimatedMax':
      return { label: '推定1RM', unit: 'kg', color: '#10b981' }
    case 'setCount':
      return { label: 'セット数', unit: 'セット', color: '#f59e0b' }
  }
}

export default function VolumeChart({ data, chartType }: Props) {
  const config = getChartConfig(chartType)

  // Chart.jsのデータ構造を作成
  const chartData = {
    // X軸のラベル（日付、週、月など）
    labels: data.map(d => d.label),
    datasets: [
      {
        label: `${config.label} (${config.unit})`,
        // Y軸のデータ
        data: data.map(d => d.value),
        // 線の色
        borderColor: config.color,
        // 線の下の塗りつぶし色（半透明）
        backgroundColor: `${config.color}33`,
        // 線の太さ (モバイル視認性向上)
        borderWidth: 3,
        // ポイントのサイズ (モバイルタッチ操作向上)
        pointRadius: 5,
        pointHoverRadius: 8,
        // 線の滑らかさ
        tension: 0.3,
      },
    ],
  }

  // Chart.jsのオプション設定（モバイル最適化）
  const options = {
    // レスポンシブ表示を有効化
    responsive: true,
    // アスペクト比を維持しない（コンテナに合わせる）
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          // モバイル向けフォントサイズ拡大
          font: { size: 14 },
          padding: 15,
        },
      },
      tooltip: {
        // モバイル向けツールチップ設定
        enabled: true,
        bodyFont: { size: 14 },
        titleFont: { size: 14 },
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      // Y軸の設定
      y: {
        // 0から始める
        beginAtZero: true,
        ticks: {
          // モバイル向けフォントサイズ拡大
          font: { size: 13 },
        },
        title: {
          display: true,
          text: config.unit,
          font: { size: 14, weight: 'bold' as const },
        },
      },
      // X軸の設定
      x: {
        ticks: {
          // モバイル向けフォントサイズ拡大
          font: { size: 13 },
          // ラベルが多い場合は自動で間引く
          maxRotation: 45,
          minRotation: 0,
        },
        title: {
          display: true,
          text: '期間',
          font: { size: 14, weight: 'bold' as const },
        },
      },
    },
    // タッチイベント対応
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  }

  return (
    <div className="w-full" style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
