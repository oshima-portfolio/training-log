'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'

export default function CsvExportPage() {
  const [records, setRecords] = useState([])

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from('sets')
        .select('*')
        .order('date', { ascending: false })
      if (!error && data) {
        setRecords(data)
      }
    }
    fetchRecords()
  }, [])

  const handleExport = () => {
    const csv = Papa.unparse(records)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, 'training_log.csv')
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-4">🗂 CSV出力</h1>
      <p>記録件数: {records.length} 件</p>
      <button onClick={handleExport}>CSVをダウンロード</button>
    </main>
  )
}
