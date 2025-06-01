"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { productAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import toast from "react-hot-toast"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    purchase_price: "",
    selling_price: "",
    quantity: "",
  })

  const categories = [
    { value: "erkak", label: "Erkaklar kiyimi" },
    { value: "ayol", label: "Ayollar kiyimi" },
    { value: "bola", label: "Bolalar kiyimi" },
    { value: "poyabzal", label: "Poyabzal" },
    { value: "aksessuar", label: "Aksessuarlar" },
  ]

  useEffect(() => {
    loadProducts()
  }, [searchTerm, categoryFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (categoryFilter) params.category = categoryFilter

      const response = await productAPI.getAll(params)
      setProducts(response.data.results || response.data)
    } catch (error) {
      toast.error("Mahsulotlarni yuklashda xatolik")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id, formData)
        toast.success("Mahsulot muvaffaqiyatli yangilandi")
      } else {
        await productAPI.create(formData)
        toast.success("Mahsulot muvaffaqiyatli qo'shildi")
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({
        name: "",
        category: "",
        size: "",
        color: "",
        purchase_price: "",
        selling_price: "",
        quantity: "",
      })
      loadProducts()
    } catch (error) {
      toast.error("Xatolik yuz berdi")
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      size: product.size,
      color: product.color,
      purchase_price: product.purchase_price,
      selling_price: product.selling_price,
      quantity: product.quantity,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      try {
        await productAPI.delete(id)
        toast.success("Mahsulot muvaffaqiyatli o'chirildi")
        loadProducts()
      } catch (error) {
        toast.error("O'chirishda xatolik")
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm"
  }

  const getCategoryLabel = (value) => {
    const category = categories.find((cat) => cat.value === value)
    return category ? category.label : value
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="text-3xl font-bold text-gray-900">Mahsulotlar</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} />
          Yangi mahsulot
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-section mb-6">
        
          <Search className="search-main" size={20} />
          <input
            type="text"
            placeholder="Mahsulotlarni qidirish..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
       

        <select  value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select status-filter ">
          <option value="">Barcha kategoriyalar</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Mahsulot</th>
              <th>Kategoriya</th>
              <th>Narx</th>
              <th>Zaxira</th>
              <th>Foyda</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="flex items-center space-x-3">
                    <Package size={20} className="text-gray-400" />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.size} - {product.color}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{getCategoryLabel(product.category)}</td>
                <td className="font-medium">{formatCurrency(product.selling_price)}</td>
                <td>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${product.quantity <= 10 ? "text-red-600" : "text-green-600"}`}>
                      {product.quantity}
                    </span>
                    {product.quantity <= 10 && <AlertTriangle size={16} className="text-red-500" />}
                  </div>
                </td>
                <td className="font-medium text-blue-600">{formatCurrency(product.profit_per_item)}</td>
                <td>
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(product)} className="btn btn-warning btn-sm">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && <div className="text-center py-8 text-gray-500">Mahsulotlar topilmadi</div>}
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingProduct(null)
          setFormData({
            name: "",
            category: "",
            size: "",
            color: "",
            purchase_price: "",
            selling_price: "",
            quantity: "",
          })
        }}
        title={editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mahsulot nomi *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Kategoriya *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Kategoriyani tanlang</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="form-group">
              <label className="form-label">O'lcham *</label>
              <input
                type="text"
                className="form-input"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rang *</label>
              <input
                type="text"
                className="form-input"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="form-group">
              <label className="form-label">Sotib olish narxi *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sotish narxi *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Miqdor *</label>
            <input
              type="number"
              className="form-input"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-danger">
              Bekor qilish
            </button>
            <button type="submit" className="btn btn-success">
              {editingProduct ? "Yangilash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Products
