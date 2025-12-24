import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { Button, Input, Modal, PageLoader } from '../../components/common';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try { const data = await categoryService.getAdminCategories(); setCategories(data.categories); }
    catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    if (cat) { setEditing(cat); setForm({ name: cat.name, description: cat.description || '' }); }
    else { setEditing(null); setForm({ name: '', description: '' }); }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSubmitting(true);
    try {
      if (editing) await categoryService.updateCategory(editing._id, form);
      else await categoryService.createCategory(form);
      toast.success(editing ? 'Updated' : 'Created');
      setModalOpen(false);
      fetchCategories();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await categoryService.deleteCategory(id); toast.success('Deleted'); fetchCategories(); }
    catch (err) { toast.error(err.message); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => openModal()}><Plus size={18} className="mr-2" /> Add Category</Button>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map(cat => (
              <tr key={cat._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4">{cat.productCount || 0}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openModal(cat)} className="p-2 hover:bg-gray-100 rounded"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows={3} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;