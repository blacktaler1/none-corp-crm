"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Users, Package, ShoppingCart, Truck, Menu } from "lucide-react"

const Layout = ({ children }) => {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Mijozlar", href: "/customers", icon: Users },
    { name: "Mahsulotlar", href: "/products", icon: Package },
    { name: "Sotuvlar", href: "/sales", icon: ShoppingCart },
    { name: "Yetkazib beruvchilar", href: "/suppliers", icon: Truck },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="sidebar-header">
          <h1 className="sidebar-title">Abduqodir CRM</h1>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Top bar */}
        <div className="topbar">
          <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn lg:hidden">
            <Menu size={20} />
          </button>

          <div className="topbar-date">
            {new Date().toLocaleDateString("uz-UZ", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Page content */}
        <main className="content-wrapper">{children}</main>
      </div>
    </div>
  )
}

export default Layout
