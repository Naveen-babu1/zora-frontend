import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Button, Input, Modal, PageLoader } from '../../components/common';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', comparePrice: '', stock: '', category: '', featured: false, isActive: true, images: [{ url: '' }] });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [prodData, catData] = await Promise.all([productService.getAdminProducts(), categoryService.getAdminCategories()]);
      setProducts(prodData.products);
      setCategories(catData.categories);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditing(product);
      setForm({ name: product.name, description: product.description, price: product.price, comparePrice: product.comparePrice || '', stock: product.stock, category: product.category?._id || '', featured: product.featured, isActive: product.isActive, images: product.images?.length ? product.images : [{ url: '' }] });
    } else {
      setEditing(null);
      setForm({ name: '', description: '', price: '', comparePrice: '', stock: '', category: '', featured: false, isActive: true, images: [{ url: '' }] });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return toast.error('Fill required fields');
    setSubmitting(true);
    try {
      const data = { ...form, images: form.images.filter(i => i.url) };
      if (editing) await productService.updateProduct(editing._id, data);
      else await productService.createProduct(data);
      toast.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      fetchData();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productService.deleteProduct(id); toast.success('Deleted'); fetchData(); }
    catch (err) { toast.error(err.message); }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button onClick={() => openModal()}><Plus size={18} className="mr-2" /> Add Product</Button>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(p => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.category?.name || '-'}</td>
                <td className="px-6 py-4 font-medium">${p.price}</td>
                <td className="px-6 py-4">{p.stock}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(p)} className="p-2 hover:bg-gray-100 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price *" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Stock *" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div><label className="block text-sm font-medium mb-1">Category *</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
          <Input label="Image URL" value={form.images[0]?.url || ''} onChange={(e) => setForm({ ...form, images: [{ url: e.target.value }] })} />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /><span className="text-sm">Featured</span></label>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;