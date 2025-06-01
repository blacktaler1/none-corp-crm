"use client"

import { useState, useEffect } from "react"
import "./style.css";
import {
  DollarSign,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  ChevronDown,
} from "lucide-react"
import { saleAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import Chart from "../components/Chart"
import toast from "react-hot-toast"

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState("monthly")
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  const timePeriods = [
    { value: "weekly", label: "Haftalik" },
    { value: "monthly", label: "Oylik" },
    { value: "yearly", label: "Yillik" },
  ]

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await saleAPI.getStatistics()
      setStats(response.data)
    } catch (error) {
      toast.error("Dashboard ma'lumotlarini yuklashda xatolik")
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm"
  }

  const calculateProfitMargin = (revenue, profit) => {
    if (revenue === 0) return 0
    return ((profit / revenue) * 100).toFixed(1)
  }

  const getCurrentPeriodData = () => {
    switch (timePeriod) {
      case "weekly":
        return stats?.charts?.weekly || []
      case "yearly":
        return stats?.charts?.yearly || []
      default:
        return stats?.charts?.monthly || []
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Statistika va ko'rsatkichlar</p>
      </header>

      <section className="main-stats">
        {[{
          title: "Bugungi daromad",
          value: formatCurrency(stats?.today?.revenue || 0),
          icon: <DollarSign />
        }, {
          title: "Bugungi foyda",
          value: formatCurrency(stats?.today?.profit || 0),
          icon: <TrendingUp />
        }, {
          title: "Bugungi sotuvlar",
          value: stats?.today?.sales_count || 0,
          icon: <ShoppingCart />
        }, {
          title: "Foyda foizi",
          value: calculateProfitMargin(stats?.today?.revenue || 0, stats?.today?.profit || 0) + "%",
          icon: <TrendingDown />
        }].map((stat, i) => (
          <div key={i} className="stat-box">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="business-stats">
        {[{
          title: "Jami mijozlar",
          value: stats?.totals?.customers || 0,
          icon: <Users />
        }, {
          title: "Jami mahsulotlar",
          value: stats?.totals?.products || 0,
          icon: <Package />
        }, {
          title: "Kam qolgan mahsulotlar",
          value: stats?.low_stock_products || 0,
          icon: <AlertTriangle />
        }, {
          title: "Yetkazib beruvchilar",
          value: stats?.totals?.suppliers || 0,
          icon: <TrendingUp />
        }].map((stat, i) => (
          <div key={i} className="stat-box">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="charts-controls">
        <div className="selector">
          <button onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}>
            <Calendar size={16} /> {timePeriods.find(p => p.value === timePeriod)?.label} <ChevronDown size={16} />
          </button>
          {showPeriodDropdown && (
            <div className="dropdown">
              {timePeriods.map(period => (
                <div
                  key={period.value}
                  className={`option ${period.value === timePeriod ? "selected" : ""}`}
                  onClick={() => { setTimePeriod(period.value); setShowPeriodDropdown(false); }}
                >
                  {period.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="charts-area">
        <Chart data={getCurrentPeriodData()} title="Sotuvlar" type="revenue" />
        <Chart data={getCurrentPeriodData()} title="Foyda" type="profit" />
      </section>

      <section className="top-products">
        <h2>Eng ko'p sotilgan mahsulotlar</h2>
        {stats?.top_products?.length ? stats.top_products.map((p, i) => (
          <div key={i} className="product-box">
            <div className="product-info">
              <span>{i + 1}</span>
              <div>
                <h4>{p.product__name}</h4>
                <p>Sotilgan: {p.total_sold} ta</p>
              </div>
            </div>
            <div className="product-sales">
              <span>{formatCurrency(p.total_revenue)}</span>
              <span>Foyda: {formatCurrency(p.total_profit || 0)}</span>
            </div>
          </div>
        )) : <p>Ma'lumot mavjud emas</p>}
      </section>

      <style jsx>{`
        .dashboard-container {
          padding: 2rem;
          font-family: sans-serif;
        }
        .dashboard-header h1 {
          font-size: 2rem;
          margin-bottom: 0.25rem;
        }
        .dashboard-header p {
          color: gray;
          margin-bottom: 1.5rem;
        }
        .main-stats, .business-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          background: #fff;
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .stat-icon {
          background: #f3f4f6;
          padding: 0.5rem;
          border-radius: 0.5rem;
        }
        .charts-controls {
          margin-bottom: 1rem;
        }
        .selector button {
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem;
          background: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .dropdown {
          margin-top: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem;
          background: white;
          position: absolute;
        }
        .option {
          padding: 0.5rem 1rem;
          cursor: pointer;
        }
        .option:hover, .option.selected {
          background-color: #f3f4f6;
        }
        .charts-area {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .top-products h2 {
          margin-bottom: 1rem;
        }
        .product-box {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          background: #fff;
        }
        .product-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .product-info span {
          font-size: 1.25rem;
          font-weight: bold;
        }
        .product-sales span {
          display: block;
          text-align: right;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
