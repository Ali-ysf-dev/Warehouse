import { useEffect, useMemo, useState, useRef } from 'react'
import { cn } from './lib/utils'

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

// Authentication constants
const AUTH_STORAGE_KEY = 'warehouse_auth'
const CORRECT_USERNAME = 'admin'
const CORRECT_PASSWORD = 'admin0648'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
  }, [darkMode])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated')
      onLogin() // This will trigger re-render and show the main app
    } else {
      setError('Invalid username or password')
      setPassword('')
    }
  }

  const surface =
    'bg-white text-slate-900 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-50 dark:ring-slate-800'
  const accent =
    'bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-400 active:bg-sky-700'

  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center transition-colors',
        darkMode ? 'bg-slate-950' : 'bg-slate-100',
      )}
    >
      <div className="w-full max-w-md px-4">
        <div
          className={cn(
            'rounded-2xl p-8 shadow-2xl ring-1 backdrop-blur',
            surface,
          )}
        >
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400 dark:text-cyan-300">
              Warehouse Management
            </p>
            <h1 className="mt-2 text-3xl font-bold">Login</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-400"
                placeholder="Enter username"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-400"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={cn(
                'w-full rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow',
                accent,
              )}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function App() {
  // Check authentication synchronously on initial render
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated'
  })
  
  const [categories, setCategories] = useState([])
  const [types, setTypes] = useState([])
  const [phones, setPhones] = useState([])
  const [products, setProducts] = useState([])
  // Initialize loading based on authentication status
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'authenticated'
  })
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [view, setView] = useState('view')
  const [filters, setFilters] = useState({
    categoryId: '',
    typeId: '',
    phoneId: '',
    color: '',
  })
  const [cart, setCart] = useState([])

  // Management form state
  const [categoryName, setCategoryName] = useState('')
  const [typeName, setTypeName] = useState('')
  const [phoneName, setPhoneName] = useState('')
  const [phoneType, setPhoneType] = useState('')
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    typeId: '',
    phoneId: '',
    color: '',
    stock: '',
    image: '',
  })
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch all data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    // Set loading to true immediately when authenticated
    setLoading(true)
    setError(null)

    const fetchAll = async () => {
      try {
        const [catsRes, typesRes, phonesRes, productsRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/types`),
          fetch(`${API_BASE}/phones`),
          fetch(`${API_BASE}/products`),
        ])

        if (!catsRes.ok || !typesRes.ok || !phonesRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [cats, types, phones, products] = await Promise.all([
          catsRes.json(),
          typesRes.json(),
          phonesRes.json(),
          productsRes.json(),
        ])

        setCategories(cats)
        setTypes(types)
        setPhones(phones)
        setProducts(products)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [isAuthenticated])

  // All hooks must be called before any conditional returns
  const colors = useMemo(() => {
    if (!isAuthenticated || !products.length) return []
    const set = new Set(products.map((p) => p.color))
    return Array.from(set)
  }, [products, isAuthenticated])

  const filteredPhones = useMemo(() => {
    if (!isAuthenticated || !filters.typeId) return phones
    return phones.filter((p) => p.typeId === filters.typeId)
  }, [phones, filters.typeId, isAuthenticated])

  const filteredProducts = useMemo(() => {
    if (!isAuthenticated) return []
    return products.filter((p) => {
      const matchCategory =
        !filters.categoryId || p.categoryId === filters.categoryId
      const matchType = !filters.typeId || p.typeId === filters.typeId
      const matchPhone = !filters.phoneId || p.phoneId === filters.phoneId
      const matchColor = !filters.color || p.color === filters.color
      return matchCategory && matchType && matchPhone && matchColor
    })
  }, [products, filters, isAuthenticated])

  const cartItemsDetailed = useMemo(() => {
    if (!isAuthenticated) return []
    return cart.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return { ...item, product }
    })
  }, [cart, products, isAuthenticated])

  // Handle login - update state and localStorage
  const handleLogin = () => {
    localStorage.setItem(AUTH_STORAGE_KEY, 'authenticated')
    setIsAuthenticated(true)
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  const productPhoneName = (product) =>
    phones.find((ph) => ph.id === product.phoneId)?.name ?? 'Unknown'

  const productTypeName = (product) =>
    types.find((t) => t.id === product.typeId)?.name ?? 'Unknown'

  const productCategoryName = (product) =>
    categories.find((c) => c.id === product.categoryId)?.name ?? 'Unknown'

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add category')
      const newCat = await res.json()
      setCategories((prev) => [...prev, newCat])
      setCategoryName('')
    } catch (err) {
      alert('Error adding category: ' + err.message)
    }
  }

  const handleAddType = async () => {
    if (!typeName.trim()) return
    try {
      const res = await fetch(`${API_BASE}/types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: typeName.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add type')
      const newType = await res.json()
      setTypes((prev) => [...prev, newType])
      setTypeName('')
    } catch (err) {
      alert('Error adding type: ' + err.message)
    }
  }

  const handleAddPhone = async () => {
    if (!phoneName.trim() || !phoneType) return
    try {
      const res = await fetch(`${API_BASE}/phones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: phoneName.trim(), typeId: phoneType }),
      })
      if (!res.ok) throw new Error('Failed to add phone')
      const newPhone = await res.json()
      setPhones((prev) => [...prev, newPhone])
      setPhoneName('')
      setPhoneType('')
    } catch (err) {
      alert('Error adding phone: ' + err.message)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return
    }

    setImageUploading(true)
    setImagePreview('')

    try {
      // Create FormData for Cloudinary upload
      const formData = new FormData()
      formData.append('file', file)
      // Use unsigned upload preset - create one in Cloudinary Dashboard > Settings > Upload
      // Set it to "Unsigned" and name it (e.g., 'warehouse_upload')
      formData.append('upload_preset', 'warehouse_upload')
      formData.append('cloud_name', 'dm8zmuzti')

      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dm8zmuzti/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || 'Failed to upload image')
      }

      const data = await response.json()
      const imageUrl = data.secure_url

      // Set the image URL in the form
      setProductForm((f) => ({ ...f, image: imageUrl }))
      setImagePreview(imageUrl)
    } catch (err) {
      alert('Error uploading image: ' + err.message)
      console.error('Upload error:', err)
    } finally {
      setImageUploading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleAddProduct = async () => {
    const { name, categoryId, typeId, phoneId, color, stock, image } =
      productForm
    if (!name || !categoryId || !typeId || !phoneId || !color || !stock) return
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          categoryId,
          typeId,
          phoneId,
          color,
          stock: Number(stock),
          image,
        }),
      })
      if (!res.ok) throw new Error('Failed to add product')
      const newProduct = await res.json()
      setProducts((prev) => [...prev, newProduct])
      setProductForm({
        name: '',
        categoryId: '',
        typeId: '',
        phoneId: '',
        color: '',
        stock: '',
        image: '',
      })
      setImagePreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      alert('Error adding product: ' + err.message)
    }
  }

  const addToCart = (product) => {
    if (product.stock <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + 1)
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQty } : item,
        )
      }
      return [...prev, { productId: product.id, quantity: 1 }]
    })
  }

  const updateCartQty = (productId, qty) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const submitCart = async () => {
    if (cart.length === 0) return
    try {
      // Update each product's stock
      const updates = cart.map(async (item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return
        const newStock = Math.max(0, product.stock - item.quantity)
        const res = await fetch(`${API_BASE}/products`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rowIndex: product._rowIndex,
            stock: newStock,
          }),
        })
        if (!res.ok) throw new Error(`Failed to update product ${product.name}`)
      })

      await Promise.all(updates)

      // Refresh products to get updated stock
      const productsRes = await fetch(`${API_BASE}/products`)
      if (productsRes.ok) {
        const updatedProducts = await productsRes.json()
        setProducts(updatedProducts)
      }

      setCart([])
      alert('Cart submitted successfully!')
    } catch (err) {
      alert('Error submitting cart: ' + err.message)
    }
  }

  const phoneOptionsForType = (typeId) =>
    phones.filter((p) => p.typeId === typeId)

  const handleDeletePhone = async (phoneId, rowIndex) => {
    if (!confirm('Delete this phone? This will also delete all products tied to this phone.'))
      return
    try {
      const res = await fetch(`${API_BASE}/phones`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      if (!res.ok) throw new Error('Failed to delete phone')

      // Refresh phones from server to ensure consistency
      const phonesRes = await fetch(`${API_BASE}/phones`)
      if (phonesRes.ok) {
        const updatedPhones = await phonesRes.json()
        setPhones(updatedPhones)
      }

      // Remove products with this phone from local state
      setProducts((prev) => prev.filter((p) => p.phoneId !== phoneId))

      setFilters((f) => ({
        ...f,
        phoneId: f.phoneId === phoneId ? '' : f.phoneId,
      }))
      setProductForm((f) => ({
        ...f,
        phoneId: f.phoneId === phoneId ? '' : f.phoneId,
      }))
    } catch (err) {
      alert('Error deleting phone: ' + err.message)
    }
  }

  const handleDeleteProduct = async (productId, rowIndex) => {
    if (!confirm('Are you sure you want to delete this product?'))
      return
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      if (!res.ok) throw new Error('Failed to delete product')

      // Refresh products from server to ensure consistency
      const productsRes = await fetch(`${API_BASE}/products`)
      if (productsRes.ok) {
        const updatedProducts = await productsRes.json()
        setProducts(updatedProducts)
      }

      // Remove from cart if it's in the cart
      setCart((prev) => prev.filter((item) => item.productId !== productId))
    } catch (err) {
      alert('Error deleting product: ' + err.message)
    }
  }

  const handleDeleteCategory = async (categoryId, rowIndex) => {
    if (!confirm('Delete this category? This will also delete all products in this category.'))
      return
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      if (!res.ok) throw new Error('Failed to delete category')

      // Refresh categories from server to ensure consistency
      const catsRes = await fetch(`${API_BASE}/categories`)
      if (catsRes.ok) {
        const updatedCats = await catsRes.json()
        setCategories(updatedCats)
      }

      // Remove products with this category from local state
      setProducts((prev) => prev.filter((p) => p.categoryId !== categoryId))

      setFilters((f) => ({
        ...f,
        categoryId: f.categoryId === categoryId ? '' : f.categoryId,
      }))
      setProductForm((f) => ({
        ...f,
        categoryId: f.categoryId === categoryId ? '' : f.categoryId,
      }))
    } catch (err) {
      alert('Error deleting category: ' + err.message)
    }
  }

  const handleDeleteType = async (typeId, rowIndex) => {
    if (
      !confirm(
        'Delete this product type? This will also delete all phones and products tied to this type.',
      )
    )
      return
    try {
      const res = await fetch(`${API_BASE}/types`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowIndex }),
      })
      if (!res.ok) throw new Error('Failed to delete type')

      // Refresh types from server to ensure consistency
      const typesRes = await fetch(`${API_BASE}/types`)
      if (typesRes.ok) {
        const updatedTypes = await typesRes.json()
        setTypes(updatedTypes)
      }

      // Remove phones and products with this type from local state
      setPhones((prev) => prev.filter((p) => p.typeId !== typeId))
      setProducts((prev) => prev.filter((p) => p.typeId !== typeId))

      setFilters((f) => {
        const nextType = f.typeId === typeId ? '' : f.typeId
        return {
          ...f,
          typeId: nextType,
          phoneId: nextType ? f.phoneId : '',
        }
      })
      setProductForm((f) => {
        const nextType = f.typeId === typeId ? '' : f.typeId
        return {
          ...f,
          typeId: nextType,
          phoneId: nextType ? f.phoneId : '',
        }
      })
    } catch (err) {
      alert('Error deleting type: ' + err.message)
    }
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', darkMode)
  }, [darkMode])

  const surface =
    'bg-white text-slate-900 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-50 dark:ring-slate-800'
  const accent =
    'bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-400 active:bg-sky-700'

  if (loading) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center transition-colors',
          darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900',
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading...</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center',
          darkMode ? 'bg-slate-950' : 'bg-slate-100',
        )}
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">
            Error: {error}
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Please check your API configuration and Google Sheets setup.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'min-h-screen transition-colors',
        darkMode
          ? 'bg-slate-950 text-slate-50'
          : 'bg-slate-100 text-slate-900',
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400 dark:text-cyan-300">
              Inventory & Storefront
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Phone Accessories Store
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Manage inventory and browse products with filters and cart.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow',
                view === 'view'
                  ? `${accent} ring-sky-400/60`
                  : `${surface} ring-1`,
              )}
              onClick={() => setView('view')}
            >
              View Products
            </button>
            <button
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium shadow-sm ring-1 transition hover:-translate-y-0.5 hover:shadow',
                view === 'manage'
                  ? `${accent} ring-sky-400/60`
                  : `${surface} ring-1`,
              )}
              onClick={() => setView('manage')}
            >
              Management
            </button>
            <button
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              onClick={() => setDarkMode((d) => !d)}
            >
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </header>

        {view === 'view' ? (
          <main className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section
              className={cn(
                'space-y-4 rounded-2xl p-6 shadow-lg ring-1 backdrop-blur',
                surface,
              )}
            >
              <h2 className="text-lg font-semibold">Filters</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  label="Product Category"
                  value={filters.categoryId}
                  onChange={(v) => setFilters((f) => ({ ...f, categoryId: v }))}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
                <FilterSelect
                  label="Product Type"
                  value={filters.typeId}
                  onChange={(v) =>
                    setFilters((f) => ({
                      ...f,
                      typeId: v,
                      phoneId: '',
                    }))
                  }
                  options={types.map((t) => ({ value: t.id, label: t.name }))}
                />
                <FilterSelect
                  label="Phone Name"
                  value={filters.phoneId}
                  onChange={(v) => setFilters((f) => ({ ...f, phoneId: v }))}
                  options={filteredPhones.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder={
                    filters.typeId ? 'Select phone' : 'Choose type first'
                  }
                  disabled={!filters.typeId}
                />
                <FilterSelect
                  label="Color"
                  value={filters.color}
                  onChange={(v) => setFilters((f) => ({ ...f, color: v }))}
                  options={colors.map((c) => ({ value: c, label: c }))}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setFilters({ categoryId: '', typeId: '', phoneId: '', color: '' })
                  }
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
                >
                  Clear filters
                </button>
              </div>
            </section>

            <aside
              className={cn(
                'rounded-2xl p-6 shadow-lg ring-1 backdrop-blur',
                surface,
              )}
            >
              <h2 className="text-lg font-semibold">Cart</h2>
              {cartItemsDetailed.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  Cart is empty.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {cartItemsDetailed.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                    >
      <div>
                        <p className="text-sm font-semibold">
                          {item.product?.name ?? 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Stock: {item.product?.stock ?? 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={item.product?.stock ?? 1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQty(item.productId, Number(e.target.value) || 1)
                          }
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <button
                          onClick={() => updateCartQty(item.productId, 0)}
                          className="rounded px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={submitCart}
                    className={cn(
                      'w-full rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow',
                      accent,
                    )}
                  >
                    Submit cart & update inventory
                  </button>
                </div>
              )}
            </aside>
          </main>
        ) : (
          <main className="mt-8 space-y-8">
            {/* Database Management Section */}
            <section
              className={cn(
                'rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl backdrop-blur-sm dark:border-slate-700/60 dark:from-slate-900/50 dark:to-slate-800/50',
              )}
            >
              <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Database Management
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Manage categories, product types, and phone models
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Add Forms */}
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Add New Items
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Add Category
                        </label>
                        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                          Example: Case, Screen Protection
                        </p>
                        <div className="flex gap-2">
                          <Input
                            label=""
                            value={categoryName}
                            onChange={setCategoryName}
                            placeholder="Category name"
                          />
                          <PrimaryButton onClick={handleAddCategory} className="shrink-0">
                            Add
                          </PrimaryButton>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Add Product Type
                        </label>
                        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                          Example: Apple, Samsung
                        </p>
                        <div className="flex gap-2">
                          <Input
                            label=""
                            value={typeName}
                            onChange={setTypeName}
                            placeholder="Type name"
                          />
                          <PrimaryButton onClick={handleAddType} className="shrink-0">
                            Add
                          </PrimaryButton>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                          Add Phone Model
                        </label>
                        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                          Select a product type first
                        </p>
                        <div className="space-y-3">
                          <Select
                            label=""
                            value={phoneType}
                            onChange={setPhoneType}
                            options={types}
                            placeholder="Select type"
                          />
                          <div className="flex gap-2">
                            <Input
                              label=""
                              value={phoneName}
                              onChange={setPhoneName}
                              placeholder="Phone name"
                            />
                            <PrimaryButton onClick={handleAddPhone} className="shrink-0">
                              Add
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manage Lists */}
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                      Manage Existing Items
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Categories
                          </label>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {categories.length}
                          </span>
                        </div>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {categories.map((c) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
                            >
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {c.name}
                              </span>
                              <button
                                onClick={() => handleDeleteCategory(c.id, c._rowIndex)}
                                className="rounded px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          {categories.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                              No categories yet
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Product Types
                          </label>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {types.length}
                          </span>
                        </div>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {types.map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
                            >
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {t.name}
                              </span>
                              <button
                                onClick={() => handleDeleteType(t.id, t._rowIndex)}
                                className="rounded px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          {types.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                              No product types yet
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Phones
                          </label>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {phones.length}
                          </span>
                        </div>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {phones.map((p) => {
                            const typeName = types.find((t) => t.id === p.typeId)?.name || 'Unknown'
                            return (
                              <div
                                key={p.id}
                                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/50"
                              >
                                <div>
                                  <span className="font-medium text-slate-700 dark:text-slate-200">
                                    {p.name}
                                  </span>
                                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                    ({typeName})
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeletePhone(p.id, p._rowIndex)}
                                  className="rounded px-2 py-1 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:text-rose-300"
                                >
                                  Delete
                                </button>
                              </div>
                            )
                          })}
                          {phones.length === 0 && (
                            <p className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                              No phones yet
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Add Product Section */}
            <section
              className={cn(
                'rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-8 shadow-xl backdrop-blur-sm dark:border-slate-700/60 dark:from-slate-900/50 dark:to-slate-800/50',
              )}
            >
              <div className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-700">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Add Product to Inventory
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Create new products with complete details
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Product name"
                  value={productForm.name}
                  onChange={(v) => setProductForm((f) => ({ ...f, name: v }))}
                  placeholder="Protective Case"
                />
                <Input
                  label="Color"
                  value={productForm.color}
                  onChange={(v) => setProductForm((f) => ({ ...f, color: v }))}
                  placeholder="Blue"
                />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Product Image
                  </label>
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={imageUploading}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-500 disabled:opacity-50 dark:text-slate-400"
                    />
                    {imageUploading && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Uploading image...
                      </p>
                    )}
                    {imagePreview && (
                      <div className="relative mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('')
                            setProductForm((f) => ({ ...f, image: '' }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute right-2 top-2 rounded-md bg-rose-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {productForm.image && !imagePreview && (
                      <div className="relative mt-2">
                        <img
                          src={productForm.image}
                          alt="Current"
                          className="h-32 w-full rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm((f) => ({ ...f, image: '' }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute right-2 top-2 rounded-md bg-rose-500 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <Input
                  label="Stock amount"
                  type="number"
                  min={0}
                  value={productForm.stock}
                  onChange={(v) => setProductForm((f) => ({ ...f, stock: v }))}
                  placeholder="10"
                />
                <Select
                  label="Category"
                  value={productForm.categoryId}
                  onChange={(v) => setProductForm((f) => ({ ...f, categoryId: v }))}
                  options={categories}
                  placeholder="Select category"
                />
                <Select
                  label="Product type"
                  value={productForm.typeId}
                  onChange={(v) =>
                    setProductForm((f) => ({ ...f, typeId: v, phoneId: '' }))
                  }
                  options={types}
                  placeholder="Select type"
                />
                <Select
                  label="Phone name"
                  value={productForm.phoneId}
                  onChange={(v) => setProductForm((f) => ({ ...f, phoneId: v }))}
                  options={phoneOptionsForType(productForm.typeId)}
                  placeholder={
                    productForm.typeId ? 'Select phone' : 'Choose type first'
                  }
                  disabled={!productForm.typeId}
                />
              </div>
              <div className="mt-6">
                <PrimaryButton onClick={handleAddProduct} className="w-full sm:w-auto">
                  Add Product to Inventory
                </PrimaryButton>
              </div>
            </section>
          </main>
        )}

        {view === 'view' && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Products</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Showing {filteredProducts.length} of {products.length}
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-2xl shadow-lg ring-1 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl',
                    surface,
                  )}
                >
                  <div 
                    className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-800/85 dark:text-slate-100">
                      {productCategoryName(product)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProduct(product.id, product._rowIndex)
                      }}
                      className="absolute right-2 top-2 rounded-md bg-rose-500 px-2 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700"
                      title="Delete product"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                    <h3 className="text-base font-semibold">{product.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {productTypeName(product)} • {productPhoneName(product)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Color: {product.color}
                    </p>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        product.stock > 0 ? 'text-emerald-500' : 'text-rose-400',
                      )}
                    >
                      Available: {product.stock}
                    </p>
                    <div className="mt-auto flex gap-2 py-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={cn(
                          'flex-1 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition',
                          product.stock === 0
                            ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                            : `${accent} hover:-translate-y-0.5 hover:shadow-lg`,
                        )}
                      >
                        {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
                No products match filters.
              </p>
            )}
          </section>
        )}

        {/* Product Image Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className={cn(
                'relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl',
                surface,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-700 shadow-lg transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="relative h-[70vh] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="border-t border-slate-200 p-6 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {selectedProduct.name}
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Category:
                    </span>{' '}
                    <span className="text-slate-900 dark:text-slate-100">
                      {productCategoryName(selectedProduct)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Type:
                    </span>{' '}
                    <span className="text-slate-900 dark:text-slate-100">
                      {productTypeName(selectedProduct)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Phone:
                    </span>{' '}
                    <span className="text-slate-900 dark:text-slate-100">
                      {productPhoneName(selectedProduct)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Color:
                    </span>{' '}
                    <span className="text-slate-900 dark:text-slate-100">
                      {selectedProduct.color}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Stock:
                    </span>{' '}
                    <span
                      className={cn(
                        'font-semibold',
                        selectedProduct.stock > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400',
                      )}
                    >
                      {selectedProduct.stock}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'All',
  disabled = false,
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Panel({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50">
      <div>
        <p className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label && <span>{label}</span>}
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-400"
      />
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled = false,
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label && <span>{label}</span>}
      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-cyan-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id ?? opt.value} value={opt.id ?? opt.value}>
            {opt.name ?? opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function PrimaryButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-md active:translate-y-0',
        className,
      )}
    >
      {children}
    </button>
  )
}

export default App
