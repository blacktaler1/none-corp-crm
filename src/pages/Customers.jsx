"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Edit, Trash2, Phone, MapPin, Calendar, Eye } from "lucide-react"
import { customerAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import SearchInput from "../components/SearchInput"
import toast from "react-hot-toast"

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [viewingCustomer, setViewingCustomer] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    notes: "",
  })

  const loadCustomers = useCallback(
    async (searchTerm = "") => {
      try {
        setLoading(true)
        const params = searchTerm ? { search: searchTerm } : {}
        const response = await customerAPI.getAll(params)
        setCustomers(response.data.results || response.data)
      } catch (error) {
        toast.error("Mijozlarni yuklashda xatolik")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // 📦 Sahifa ochilganda mijozlarni yuklaymiz
  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])
  
  const handleSearch = useCallback(
    (searchTerm) => {
      loadCustomers(searchTerm)
    },
    [loadCustomers],
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCustomer) {
        await customerAPI.update(editingCustomer.id, formData)
        toast.success("Mijoz muvaffaqiyatli yangilandi")
      } else {
        await customerAPI.create(formData)
        toast.success("Mijoz muvaffaqiyatli qo'shildi")
      }

      setShowModal(false)
      setEditingCustomer(null)
      setFormData({ name: "", phone: "", address: "", email: "", notes: "" })
      loadCustomers()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      email: customer.email || "",
      notes: customer.notes || "",
    })
    setShowModal(true)
  }

  const handleView = (customer) => {
    setViewingCustomer(customer)
    setShowViewModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await customerAPI.delete(id)
        toast.success("Mijoz muvaffaqiyatli o'chirildi")
        loadCustomers()
      } catch (error) {
        toast.error("O'chirishda xatolik")
      }
    }
  }

 

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mijozlar</h1>
          <p className="page-subtitle">Mijozlar ma'lumotlarini boshqarish</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} />
          Yangi mijoz
        </button>
      </div>

      {/* Search */}
      <div className="search-section">
        <SearchInput placeholder="Mijozlarni qidirish..." onSearch={handleSearch} className="search-main" />
      </div>

      {/* Customers Table */}
      <div className="data-table-container">
        <div className="data-table">
          <table className="table">
            <thead>
              <tr>
                <th>Mijoz</th>
                <th>Aloqa</th>
                <th>Manzil</th>
                <th>Qo'shilgan sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="table-row">
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">{customer.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="customer-name">{customer.name}</div>
                        {customer.email && <div className="customer-email">{customer.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <Phone size={16} className="contact-icon" />
                      <span>{customer.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="address-info">
                      <MapPin size={16} className="address-icon" />
                      <span>{customer.address || "Manzil ko'rsatilmagan"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <Calendar size={16} className="date-icon" />
                      <span>{new Date(customer.created_at).toLocaleDateString("uz-UZ")}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleView(customer)} className="btn btn-info btn-sm" title="Ko'rish">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(customer)}
                        className="btn btn-warning btn-sm"
                        title="Tahrirlash"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="btn btn-danger btn-sm"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Mijozlar topilmadi</h3>
              <p>Hozircha mijozlar ma'lumoti yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCustomer(null)
          setFormData({ name: "", phone: "", address: "", email: "", notes: "" })
        }}
        title={editingCustomer ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"}
      >
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Ism *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefon *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manzil</label>
            <textarea
              className="form-textarea"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
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

          <div className="form-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCustomer ? "Yangilash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setViewingCustomer(null)
        }}
        title="Mijoz ma'lumotlari"
      >
        {viewingCustomer && (
          <div className="customer-details">
            <div className="customer-header">
              <div className="customer-avatar-large">{viewingCustomer.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="customer-name-large">{viewingCustomer.name}</h3>
                <p className="customer-id">ID: #{viewingCustomer.id}</p>
              </div>
            </div>

            <div className="customer-info-grid">
              <div className="info-item">
                <Phone className="info-icon" size={20} />
                <div>
                  <label>Telefon</label>
                  <span>{viewingCustomer.phone}</span>
                </div>
              </div>

              {viewingCustomer.email && (
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <div>
                    <label>Email</label>
                    <span>{viewingCustomer.email}</span>
                  </div>
                </div>
              )}

              <div className="info-item">
                <MapPin className="info-icon" size={20} />
                <div>
                  <label>Manzil</label>
                  <span>{viewingCustomer.address || "Ko'rsatilmagan"}</span>
                </div>
              </div>

              <div className="info-item">
                <Calendar className="info-icon" size={20} />
                <div>
                  <label>Qo'shilgan sana</label>
                  <span>{new Date(viewingCustomer.created_at).toLocaleDateString("uz-UZ")}</span>
                </div>
              </div>
            </div>

            {viewingCustomer.notes && (
              <div className="customer-notes">
                <h4>Izohlar</h4>
                <p>{viewingCustomer.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Customers
