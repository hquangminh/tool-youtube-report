// src/components/DataUpload.js
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

function DataUpload() {
  const [data, setData] = useState([])
  const navigate = useNavigate()

  const formatDuration = (duration) => {
    if (typeof duration === 'string') {
      const parts = duration.split(':')

      if (parts.length === 3) {
        // Đây là định dạng giờ:phút:giây (hh:mm:ss)
        const hours = parseInt(parts[0], 10)
        const minutes = parseInt(parts[1], 10)
        const seconds = parseInt(parts[2], 10)
        const totalMinutes = hours * 60 + minutes // Chuyển đổi giờ sang phút
        return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      } else if (parts.length === 2) {
        // Đây là định dạng phút:giây (mm:ss)
        const minutes = parseInt(parts[0], 10)
        const seconds = parseInt(parts[1], 10)
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      }
    }

    return duration // Trả về giá trị gốc nếu không khớp điều kiện
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const formattedData = results.data.map((row) => ({
              ...row,
              'Video duration': formatDuration(row['Video duration']),
            }))
            setData(formattedData)
          },
        })
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader()
        reader.onload = (e) => {
          const binaryStr = e.target.result
          const workbook = XLSX.read(binaryStr, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          const headers = jsonData[0]
          const rows = jsonData.slice(1)
          const formattedData = rows.map((row) => {
            const rowData = {}
            row.forEach((cell, index) => {
              rowData[headers[index]] = headers[index] === 'Video duration' ? formatDuration(cell) : cell
            })
            return rowData
          })
          setData(formattedData)
        }
        reader.readAsBinaryString(file)
      } else {
        alert('Unsupported file type. Please upload a CSV or Excel file.')
      }
    }
  }

  const handleAnalyze = () => {
    navigate('/data-analysis', { state: { data } })
  }

  return (
    <div>
      <h2>Tải lên dữ liệu từ YouTube</h2>
      <input type='file' accept='.csv, .xlsx, .xls' onChange={handleFileUpload} />
      {data.length > 0 && (
        <div>
          <table>
            <thead>
              <tr>
                <th>Tiêu đề Video</th>
                <th>Độ dài Video</th>
                <th>Thời gian đăng</th>
                <th>Lượt xem</th>
                <th>Thời gian xem (giờ)</th>
                <th>Người đăng ký</th>
                <th>CTR (%)</th>
                <th>Impressions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row['Video title']}</td>
                  <td>{row['Video duration']}</td>
                  <td>{row['Video publish time']}</td>
                  <td>{row['Views']}</td>
                  <td>{row['Watch time (hours)']}</td>
                  <td>{row['Subscribers']}</td>
                  <td>{row['Impressions click-through rate (%)']}</td>
                  <td>{row['Impressions']}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleAnalyze}>Phân tích dữ liệu</button>
        </div>
      )}
    </div>
  )
}

export default DataUpload
