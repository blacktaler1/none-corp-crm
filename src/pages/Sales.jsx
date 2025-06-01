"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, ShoppingCart, Clock, CheckCircle, Truck, XCircle, Eye } from "lucide-react"
import { saleAPI, customerAPI, productAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import SearchInput from "../components/SearchInput"
import toast from "react-hot-toast"

const Sales = () => {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [viewingSale, setViewingSale] = useState(null)
  const [statusFilter, setStatusFilter] = useState("")

  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    quantity: "",
    unit_price: "",
    payment_method: "naqd",
    status: "pending",
    notes: "",
  })

  const paymentMethods = [
    { value: "naqd", label: "Naqd pul" },
    { value: "plastik", label: "Plastik karta" },
    { value: "nasiya", label: "Nasiya" },
  ]

  const statusOptions = [
    { value: "pending", label: "Kutilmoqda", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
    { value: "confirmed", label: "Tasdiqlangan", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
    { value: "delivered", label: "Yetkazilgan", icon: Truck, color: "text-green-600 bg-green-100" },
    { value: "cancelled", label: "Bekor qilingan", icon: XCircle, color: "text-red-600 bg-red-100" },
  ]

  const loadData = useCallback(
    async (searchTerm = "") => {
      try {
        setLoading(true)
        const params = {}
        if (searchTerm) params.search = searchTerm
        if (statusFilter) params.status = statusFilter

        const [salesResponse, customersResponse, productsResponse] = await Promise.all([
          saleAPI.getAll(params),
          customerAPI.getAll(),
          productAPI.getAll(),
        ])

        setSales(salesResponse.data.results || salesResponse.data)
        setCustomers(customersResponse.data.results || customersResponse.data)
        setProducts(productsResponse.data.results || productsResponse.data)
      } catch (error) {
        console.error("Ma'lumotlarni yuklashda xatolik:", error)
        toast.error("Ma'lumotlarni yuklashda xatolik")
      } finally {
        setLoading(false)
      }
    },
    [statusFilter],
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = useCallback(
    (searchTerm) => {
      loadData(searchTerm)
    },
    [loadData],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSale) {
        await saleAPI.update(editingSale.id, formData)
        toast.success("Sotuv muvaffaqiyatli yangilandi")
      } else {
        await saleAPI.create(formData)
        toast.success("Sotuv muvaffaqiyatli qo'shildi")
      }

      setShowModal(false)
      setEditingSale(null)
      setFormData({
        customer: "",
        product: "",
        quantity: "",
        unit_price: "",
        payment_method: "naqd",
        status: "pending",
        notes: "",
      })
      loadData()
    } catch (error) {
      if (error.response?.data) {
        const errorMessage = Object.values(error.response.data).flat().join(", ")
        toast.error(errorMessage)
      } else {
        toast.error("Xatolik yuz berdi")
      }
    }
  }

  const handleProductChange = (e) => {
    const productId = e.target.value
    const selectedProduct = products.find((p) => p.id === Number.parseInt(productId))

    setFormData({
      ...formData,
      product: productId,
      unit_price: selectedProduct ? selectedProduct.selling_price : "",
    })
  }

  const handleEdit = (sale) => {
    setEditingSale(sale)
    setFormData({
      customer: sale.customer,
      product: sale.product,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      payment_method: sale.payment_method,
      status: sale.status,
      notes: sale.notes || "",
    })
    setShowModal(true)
  }

  const handleView = (sale) => {
    setViewingSale(sale)
    setShowViewModal(true)
  }

  const handleStatusChange = async (saleId, newStatus) => {
    try {
      const sale = sales.find((s) => s.id === saleId)
      await saleAPI.update(saleId, { ...sale, status: newStatus })
      toast.success("Holat muvaffaqiyatli yangilandi")
      loadData()
    } catch (error) {
      toast.error("Holatni yangilashda xatolik")
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await saleAPI.delete(id)
        toast.success("Sotuv muvaffaqiyatli o'chirildi")
        loadData()
      } catch (error) {
        toast.error("O'chirishda xatolik")
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm"
  }

  const getStatusInfo = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0]
  }

  const getPaymentMethodLabel = (value) => {
    const method = paymentMethods.find((m) => m.value === value)
    return method ? method.label : value
  }

    // if (loading) {
    //   return <LoadingSpinner />
    // }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sotuvlar</h1>
          <p className="page-subtitle">Sotuvlar va buyurtmalarni boshqarish</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} />
          Yangi sotuv
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <SearchInput placeholder="Sotuvlarni qidirish..." onSearch={handleSearch} className="search-main" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select status-filter"
        >
          <option value="">Barcha holatlar</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sales Table */}
      <div className="data-table-container">
        <div className="data-table">
          <table className="table">
            <thead>
              <tr>
                <th>Mijoz</th>
                <th>Mahsulot</th>
                <th>Miqdor</th>
                <th>Jami summa</th>
                <th>Holat</th>
                <th>To'lov</th>
                <th>Sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const statusInfo = getStatusInfo(sale.status)
                const StatusIcon = statusInfo.icon
                return (
                  <tr key={sale.id} className="table-row">
                    <td>
                      <div className="customer-info">
                        <div className="customer-avatar">{sale.customer_name.charAt(0).toUpperCase()}</div>
                        <span className="customer-name">{sale.customer_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="product-info">
                        <ShoppingCart size={16} className="product-icon" />
                        <span>{sale.product_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="quantity-badge">{sale.quantity} ta</span>
                    </td>
                    <td>
                      <span className="amount-text">{formatCurrency(sale.total_amount)}</span>
                    </td>
                    <td>
                      <div className="status-container">
                        <select
                          value={sale.status}
                          onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                          className={`status-select ${statusInfo.color}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <StatusIcon size={16} className="status-icon" />
                      </div>
                    </td>
                    <td>
                      <span className="payment-method">{getPaymentMethodLabel(sale.payment_method)}</span>
                    </td>
                    <td>
                      <span className="date-text">{new Date(sale.sale_date).toLocaleDateString("uz-UZ")}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleView(sale)} className="btn btn-info btn-sm" title="Ko'rish">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEdit(sale)} className="btn btn-warning btn-sm" title="Tahrirlash">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="btn btn-danger btn-sm"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {sales.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>Sotuvlar topilmadi</h3>
              <p>Hozircha sotuvlar ma'lumoti yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSale(null)
          setFormData({
            customer: "",
            product: "",
            quantity: "",
            unit_price: "",
            payment_method: "naqd",
            status: "pending",
            notes: "",
          })
        }}
        title={editingSale ? "Sotuvni tahrirlash" : "Yangi sotuv qo'shish"}
      >
        <form onSubmit={handleSubmit} className="sale-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Mijoz *</label>
              <select
                className="form-select"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                required
              >
                <option value="">Mijozni tanlang</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mahsulot *</label>
              <select className="form-select" value={formData.product} onChange={handleProductChange} required>
                <option value="">Mahsulotni tanlang</option>
                {products
                  .filter((p) => p.quantity > 0)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.size} - {product.color} (Mavjud: {product.quantity}ta)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Miqdor *</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Birlik narxi *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">To'lov usuli</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Holat</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Izohlar</label>
            <textarea
              className="form-textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {formData.quantity && formData.unit_price && (
            <div className="total-amount">
              <strong>Jami summa: {formatCurrency(formData.quantity * formData.unit_price)}</strong>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSale ? "Yangilash" : "Sotuvni saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Sale View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setViewingSale(null)
        }}
        title="Sotuv ma'lumotlari"
      >
        {viewingSale && (
          <div className="sale-details">
            <div className="sale-header">
              <div className="sale-id">Sotuv #{viewingSale.id}</div>
              <div className={`sale-status ${getStatusInfo(viewingSale.status).color}`}>
                {getStatusInfo(viewingSale.status).label}
              </div>
            </div>

            <div className="sale-info-grid">
              <div className="info-section">
                <h4>Mijoz ma'lumotlari</h4>
                <p>
                  <strong>Ism:</strong> {viewingSale.customer_name}
                </p>
              </div>

              <div className="info-section">
                <h4>Mahsulot ma'lumotlari</h4>
                <p>
                  <strong>Mahsulot:</strong> {viewingSale.product_name}
                </p>
                <p>
                  <strong>Miqdor:</strong> {viewingSale.quantity} ta
                </p>
                <p>
                  <strong>Birlik narxi:</strong> {formatCurrency(viewingSale.unit_price)}
                </p>
              </div>

              <div className="info-section">
                <h4>To'lov ma'lumotlari</h4>
                <p>
                  <strong>Jami summa:</strong> {formatCurrency(viewingSale.total_amount)}
                </p>
                <p>
                  <strong>To'lov usuli:</strong> {getPaymentMethodLabel(viewingSale.payment_method)}
                </p>
              </div>

              <div className="info-section">
                <h4>Sana ma'lumotlari</h4>
                <p>
                  <strong>Sotuv sanasi:</strong> {new Date(viewingSale.sale_date).toLocaleDateString("uz-UZ")}
                </p>
                {viewingSale.delivery_date && (
                  <p>
                    <strong>Yetkazish sanasi:</strong> {new Date(viewingSale.delivery_date).toLocaleDateString("uz-UZ")}
                  </p>
                )}
              </div>
            </div>

            {viewingSale.notes && (
              <div className="sale-notes">
                <h4>Izohlar</h4>
                <p>{viewingSale.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Sales
