"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Truck, Mail, Phone } from "lucide-react"
import { supplierAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import toast from "react-hot-toast"

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  })

  useEffect(() => {
    loadSuppliers()
  }, [searchTerm])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const params = searchTerm ? { search: searchTerm } : {}
      const response = await supplierAPI.getAll(params)
      setSuppliers(response.data.results || response.data)
    } catch (error) {
      toast.error("Yetkazib beruvchilarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSupplier) {
        await supplierAPI.update(editingSupplier.id, formData)
        toast.success("Yetkazib beruvchi muvaffaqiyatli yangilandi")
      } else {
        await supplierAPI.create(formData)
        toast.success("Yetkazib beruvchi muvaffaqiyatli qo'shildi")
      }

      setShowModal(false)
      setEditingSupplier(null)
      setFormData({ name: "", company: "", phone: "", email: "", address: "" })
      loadSuppliers()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      company: supplier.company,
      phone: supplier.phone,
      email: supplier.email || "",
      address: supplier.address || "",
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await supplierAPI.delete(id)
        toast.success("Yetkazib beruvchi muvaffaqiyatli o'chirildi")
        loadSuppliers()
      } catch (error) {
        toast.error("O'chirishda xatolik")
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yetkazib beruvchilar</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} />
          Yangi yetkazib beruvchi
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <div className="search-input relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Yetkazib beruvchilarni qidirish..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Yetkazib beruvchi</th>
              <th>Kompaniya</th>
              <th>Aloqa</th>
              <th>Manzil</th>
              <th>Qo'shilgan sana</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <Truck size={20} className="text-gray-400" />
                    <div className="font-medium">{supplier.name}</div>
                  </div>
                </td>
                <td>{supplier.company}</td>
                <td>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm">{supplier.phone}</span>
                    </div>
                    {supplier.email && (
                      <div className="flex items-center space-x-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm">{supplier.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>{supplier.address || "-"}</td>
                <td>{new Date(supplier.created_at).toLocaleDateString("uz-UZ")}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(supplier)} className="btn btn-warning btn-sm">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="btn btn-danger btn-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {suppliers.length === 0 && <div className="text-center py-8 text-gray-500">Yetkazib beruvchilar topilmadi</div>}
      </div>

      {/* Supplier Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSupplier(null)
          setFormData({ name: "", company: "", phone: "", email: "", address: "" })
        }}
        title={editingSupplier ? "Yetkazib beruvchini tahrirlash" : "Yangi yetkazib beruvchi qo'shish"}
      >
        <form onSubmit={handleSubmit}>
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
            <label className="form-label">Kompaniya *</label>
            <input
              type="text"
              className="form-input"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-danger">
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-success">
              {editingSupplier ? "Yangilash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Suppliers
