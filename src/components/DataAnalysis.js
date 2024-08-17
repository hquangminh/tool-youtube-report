// src/components/DataAnalysis.js
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pie } from 'react-chartjs-2'
import Chart from 'chart.js/auto'
import { ArcElement, Tooltip, Legend } from 'chart.js'
import * as XLSX from 'xlsx'
import './DataAnalysis.css'

Chart.register(ArcElement, Tooltip, Legend)

function DataAnalysis() {
  const location = useLocation()
  const navigate = useNavigate()

  const { data } = location.state

  const labels = data.map((video) => video['Video title'])
  const viewsData = data.map((video) => parseInt(video['Views']))
  const ctrData = data.map((video) => parseFloat(video['Impressions click-through rate (%)']))
  const watchTimeData = data.map((video) => parseFloat(video['Watch time (hours)']))

  const viewsChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Lượt xem',
        data: viewsData,
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(192, 75, 75, 0.6)',
          'rgba(75, 75, 192, 0.6)',
          'rgba(192, 192, 75, 0.6)',
          'rgba(75, 192, 75, 0.6)',
        ],
        hoverOffset: 4,
      },
    ],
  }

  const ctrChartData = {
    labels: labels,
    datasets: [
      {
        label: 'CTR (%)',
        data: ctrData,
        backgroundColor: [
          'rgba(192, 75, 75, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(192, 192, 75, 0.6)',
          'rgba(75, 75, 192, 0.6)',
          'rgba(75, 192, 75, 0.6)',
        ],
        hoverOffset: 4,
      },
    ],
  }

  const watchTimeChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Thời gian xem (giờ)',
        data: watchTimeData,
        backgroundColor: [
          'rgba(75, 75, 192, 0.6)',
          'rgba(192, 75, 75, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(192, 192, 75, 0.6)',
          'rgba(75, 192, 75, 0.6)',
        ],
        hoverOffset: 4,
      },
    ],
  }

  const analyzeVideo = (video) => {
    const strategies = []
    const views = parseInt(video['Views'])
    const watchTime = parseFloat(video['Watch time (hours)'])
    const ctr = parseFloat(video['Impressions click-through rate (%)'])
    const impressions = parseInt(video['Impressions'])
    const subscribers = parseInt(video['Subscribers'])
    const videoDuration = video['Video duration']

    if (video['Video title'] && video['Video title'].trim()) {
      if (typeof videoDuration === 'string' && videoDuration.trim()) {
        const durationParts = videoDuration.split(':')
        const durationInSeconds = parseInt(durationParts[0], 10) * 60 + parseInt(durationParts[1], 10) // Độ dài video tính bằng giây
        const durationInMinutes = durationInSeconds / 60 // Độ dài video tính bằng phút

        const avgViewDuration = (watchTime * 60) / views // Thời gian xem trung bình (phút)
        const retentionRate = (avgViewDuration / durationInMinutes) * 100 // Tỷ lệ giữ chân người xem (%)

        // Phân tích thời gian xem trung bình so với độ dài video
        if (avgViewDuration > durationInMinutes) {
          strategies.push(
            `Video "${video['Video title']}" có thời gian xem trung bình ${avgViewDuration.toFixed(
              2
            )} phút, vượt xa độ dài video ${durationInMinutes.toFixed(
              2
            )} phút. Điều này có thể cho thấy rằng người xem đang xem lại video nhiều lần hoặc có lỗi trong cách ghi nhận dữ liệu. Kiểm tra thêm để xác định nguyên nhân cụ thể.`
          )
        } else if (avgViewDuration < durationInMinutes / 2) {
          strategies.push(
            `Video "${video['Video title']}" có thời gian xem trung bình ${avgViewDuration.toFixed(2)} phút, chiếm ${retentionRate.toFixed(
              2
            )}% so với độ dài video ${durationInMinutes.toFixed(
              2
            )} phút. Điều này có thể chỉ ra rằng nội dung không giữ được sự quan tâm của người xem. Cân nhắc điều chỉnh nội dung để làm video hấp dẫn hơn hoặc ngắn gọn hơn.`
          )
        } else {
          strategies.push(
            `Video "${video['Video title']}" có thời gian xem trung bình ${avgViewDuration.toFixed(2)} phút, chiếm ${retentionRate.toFixed(
              2
            )}% so với độ dài video ${durationInMinutes.toFixed(
              2
            )} phút. Đây là một kết quả tốt, cho thấy nội dung đang giữ được sự quan tâm của người xem.`
          )
        }

        // Phân tích nếu CTR thấp
        if (ctr < 5) {
          strategies.push(
            `Video "${video['Video title']}" có CTR thấp (${ctr}%), cho thấy rằng tiêu đề và hình ảnh thu nhỏ của video có thể chưa đủ hấp dẫn. Cân nhắc tối ưu hóa tiêu đề và hình ảnh thu nhỏ để cải thiện tỷ lệ nhấp.`
          )
        } else {
          strategies.push(
            `Video "${video['Video title']}" có CTR tốt (${ctr}%), tuy nhiên, vẫn có thể cải thiện hơn nữa bằng cách thử nghiệm với tiêu đề và thumbnail khác nhau để xem xét những yếu tố thu hút tốt nhất.`
          )
        }

        // Phân tích tỷ lệ chuyển đổi từ Impressions sang Lượt xem
        const viewRate = (views / impressions) * 100
        if (viewRate > 100) {
          strategies.push(
            `Video "${video['Video title']}" có tỷ lệ chuyển đổi từ Impressions sang Lượt xem là ${viewRate.toFixed(
              2
            )}%, có thể do lỗi trong cách ghi nhận dữ liệu hoặc tính toán. Vui lòng kiểm tra lại số liệu.`
          )
        } else if (viewRate < 10) {
          strategies.push(
            `Video "${video['Video title']}" có tỷ lệ chuyển đổi từ Impressions sang Lượt xem là ${viewRate.toFixed(
              2
            )}%, cho thấy rằng video có thể cần phải tối ưu hóa hoặc thay đổi chiến lược quảng bá để tiếp cận đúng đối tượng khán giả.`
          )
        } else {
          strategies.push(
            `Tỷ lệ chuyển đổi từ Impressions sang Lượt xem của video "${video['Video title']}" là ${viewRate.toFixed(
              2
            )}%, đây là một kết quả tốt. Tiếp tục tập trung vào chiến lược hiện tại và thử nghiệm với các yếu tố nhỏ để cải thiện hơn nữa.`
          )
        }

        // Phân tích số lượng người đăng ký mới
        const subscriberRate = (subscribers / views) * 100
        if (subscribers < 5) {
          strategies.push(
            `Video "${
              video['Video title']
            }" chỉ thu hút ${subscribers} người đăng ký mới từ ${views} lượt xem (tỷ lệ chuyển đổi là ${subscriberRate.toFixed(
              2
            )}%). Cân nhắc cải thiện lời kêu gọi hành động trong video và đảm bảo rằng nội dung cung cấp giá trị đủ để khuyến khích người xem đăng ký.`
          )
        } else {
          strategies.push(
            `Video "${
              video['Video title']
            }" đã thu hút ${subscribers} người đăng ký mới từ ${views} lượt xem (tỷ lệ chuyển đổi là ${subscriberRate.toFixed(
              2
            )}%). Đây là một kết quả tích cực, nhưng vẫn có thể cải thiện thêm bằng cách thử các chiến lược lời kêu gọi hành động khác nhau.`
          )
        }
      } else {
        strategies.push(`Video "${video['Video title']}" không có thông tin về độ dài video hoặc dữ liệu không đúng định dạng.`)
      }
    } else {
      strategies.push(
        `Video "Unnamed Video" có các chỉ số như sau: Lượt xem ${views}, Thời gian xem ${watchTime} giờ, Người đăng ký mới ${subscribers}, CTR ${ctr}%, Impressions ${impressions}. Nên tập trung vào việc tăng cường các yếu tố quảng bá và tối ưu hóa nội dung để nâng cao những chỉ số này.`
      )
    }

    return strategies
  }

  const downloadAnalysis = () => {
    const wb = XLSX.utils.book_new()

    // Phân tích tổng quan kênh
    const totalViews = data.reduce((sum, video) => sum + parseInt(video['Views']), 0)
    const totalWatchTime = data.reduce((sum, video) => sum + parseFloat(video['Watch time (hours)']), 0)
    const totalSubscribers = data.reduce((sum, video) => sum + parseInt(video['Subscribers']), 0)
    const totalImpressions = data.reduce((sum, video) => sum + parseInt(video['Impressions']), 0)
    const avgCTR = (data.reduce((sum, video) => sum + parseFloat(video['Impressions click-through rate (%)']), 0) / data.length).toFixed(2)

    const totalAnalysis = [
      ['Tổng quan kênh'],
      ['Tổng lượt xem', totalViews],
      ['Tổng thời gian xem (giờ)', totalWatchTime],
      ['Tổng người đăng ký mới', totalSubscribers],
      ['Tổng số lần hiển thị', totalImpressions],
      ['CTR trung bình (%)', avgCTR],
      [],
      ['Chiến lược cải thiện kênh'],
      // Thêm chiến lược tổng quan ở đây
      'Cân nhắc tăng cường quảng bá toàn bộ kênh để nâng cao lượt xem và tỷ lệ nhấp (CTR). Đảm bảo rằng các tiêu đề video và hình ảnh thu nhỏ (thumbnails) được tối ưu hóa để thu hút sự chú ý. Sử dụng phân tích dữ liệu để xác định các nội dung có hiệu suất cao và nhân rộng các yếu tố thành công đó.',
    ]

    const ws_total = XLSX.utils.aoa_to_sheet(totalAnalysis)
    XLSX.utils.book_append_sheet(wb, ws_total, 'Tổng quan kênh')

    // Phân tích chi tiết từng video
    data.forEach((video) => {
      const cleanTitle = video['Video title'] ? video['Video title'].replace(/[:\\/?*[\]]/g, '_') : 'Unnamed_Video' // Replace invalid characters with '_'
      const ws_data = [
        ['Video Title', video['Video title']],
        ['Độ dài video', video['Video duration']],
        ['Thời gian đăng', video['Video publish time']],
        ['Lượt xem', video['Views']],
        ['Thời gian xem (giờ)', video['Watch time (hours)']],
        ['Người đăng ký mới', video['Subscribers']],
        ['CTR (%)', video['Impressions click-through rate (%)']],
        ['Impressions', video['Impressions']],
        [],
        ['Chiến lược cải thiện'],
        ...analyzeVideo(video).map((strategy) => [strategy]),
      ]

      const ws = XLSX.utils.aoa_to_sheet(ws_data)
      XLSX.utils.book_append_sheet(wb, ws, cleanTitle.substring(0, 30)) // Use cleaned title as sheet name
    })

    XLSX.writeFile(wb, 'video_analysis.xlsx')
  }

  return (
    <div className='data-analysis-container'>
      <button className='back-button' onClick={() => navigate(-1)}>
        Quay lại
      </button>
      <button className='download-button' onClick={downloadAnalysis}>
        Tải xuống phân tích
      </button>

      <h2>Phân tích chi tiết cho từng video</h2>

      <div className='chart-section'>
        <h3>Biểu đồ Lượt xem</h3>
        <Pie data={viewsChartData} />
      </div>

      <div className='chart-section'>
        <h3>Biểu đồ CTR (%)</h3>
        <Pie data={ctrChartData} />
      </div>

      <div className='chart-section'>
        <h3>Biểu đồ Thời gian xem (giờ)</h3>
        <Pie data={watchTimeChartData} />
      </div>

      {data.map((video, index) => (
        <div key={index} className='video-analysis'>
          <h3>{video['Video title']}</h3>
          <p>
            <strong>Độ dài video:</strong> {video['Video duration']}
          </p>
          <p>
            <strong>Thời gian đăng:</strong> {video['Video publish time']}
          </p>
          <p>
            <strong>Lượt xem:</strong> {video['Views']}
          </p>
          <p>
            <strong>Thời gian xem:</strong> {video['Watch time (hours)']} giờ
          </p>
          <p>
            <strong>Người đăng ký mới:</strong> {video['Subscribers']}
          </p>
          <p>
            <strong>CTR:</strong> {video['Impressions click-through rate (%)']}%
          </p>
          <p>
            <strong>Impressions:</strong> {video['Impressions']}
          </p>

          <h4>Chiến lược cải thiện:</h4>
          <ul>
            {analyzeVideo(video).map((strategy, i) => (
              <li key={i}>{strategy}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DataAnalysis
