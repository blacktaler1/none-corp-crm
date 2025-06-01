"use client"

const Chart = ({ data, type = "revenue", title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>Ma'lumot yo'q</p>
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((item) => item[type] || 0))

  const formatValue = (value) => {
    if (type === "revenue" || type === "profit") {
      return new Intl.NumberFormat("uz-UZ", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    }
    return value
  }

  const getLabel = (item, index) => {
    if (item.month) return item.month.slice(-2)
    if (item.week) return item.week.split(" - ")[0]
    if (item.year) return item.year
    return `${index + 1}`
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">{title}</h3>
      <div>
        {data.map((item, index) => (
          <div key={index} className="chart-bar">
            <div className="chart-label">{getLabel(item, index)}</div>
            <div className="chart-progress">
              <div
                className="chart-fill"
                style={{
                  width: `${maxValue > 0 ? (item[type] / maxValue) * 100 : 0}%`,
                }}
              >
                {item[type] > 0 && <span className="chart-value">{formatValue(item[type])}</span>}
              </div>
            </div>
            <div className="chart-count">{item.sales_count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Chart
