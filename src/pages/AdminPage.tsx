import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, LogOut, Plus, Save, Trash2, X } from 'lucide-react';
import ProductImage from '../components/ProductImage';
import { apiRequest, uploadBinary } from '../lib/api';
import { compressImage } from '../lib/image';
import { useI18n } from '../i18n/useI18n';
import { useMenuStore } from '../store/menu';

interface AdminCategory {
  id: string;
  nameRu: string;
  nameEn: string;
  active: boolean;
  sortOrder: number;
}

interface AdminProduct {
  id: string;
  categoryId: string;
  category: { nameRu: string };
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  priceKgs: number;
  imageUrl: string | null;
  available: boolean;
  active: boolean;
  sortOrder: number;
}

interface Catalog {
  categories: AdminCategory[];
  products: AdminProduct[];
}

interface CategoryForm {
  nameRu: string;
  nameEn: string;
  active: boolean;
  sortOrder: number;
}

interface ProductForm {
  categoryId: string;
  nameRu: string;
  nameEn: string;
  descriptionRu: string;
  descriptionEn: string;
  priceKgs: number;
  imageUrl: string;
  available: boolean;
  active: boolean;
  sortOrder: number;
}

const blankCategory: CategoryForm = { nameRu: '', nameEn: '', active: true, sortOrder: 0 };
const blankProduct = (categoryId = ''): ProductForm => ({
  categoryId,
  nameRu: '',
  nameEn: '',
  descriptionRu: '',
  descriptionEn: '',
  priceKgs: 0,
  imageUrl: '',
  available: true,
  active: true,
  sortOrder: 0,
});

export default function AdminPage() {
  const { t } = useI18n();
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [catalog, setCatalog] = useState<Catalog>({ categories: [], products: [] });
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(blankCategory);
  const [productForm, setProductForm] = useState<ProductForm>(blankProduct());
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const imageInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return;
    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const loadCatalog = useCallback(async () => {
    const data = await apiRequest<Catalog>('/admin/catalog');
    setCatalog(data);
    setProductForm((current) => ({
      ...current,
      categoryId: current.categoryId || data.categories[0]?.id || '',
    }));
  }, []);

  useEffect(() => {
    apiRequest<{ username: string }>('/admin/session')
      .then((session) => {
        setUsername(session.username);
        setAuthenticated(true);
      })
      .catch((sessionError: unknown) => {
        setAuthenticated(false);
        if (
          sessionError instanceof Error &&
          !sessionError.message.startsWith('Требуется вход') &&
          !sessionError.message.startsWith('Сессия истекла')
        ) {
          setError(sessionError.message);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    loadCatalog().catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить каталог.');
    });
  }, [authenticated, loadCatalog]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Не удалось выполнить действие.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      const session = await apiRequest<{ username: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setUsername(session.username);
      setPassword('');
      setAuthenticated(true);
    }, 'Вход выполнен.');
  };

  const handleLogout = async () => {
    await runAction(async () => {
      await apiRequest<void>('/admin/logout', { method: 'POST' });
      setAuthenticated(false);
      setCatalog({ categories: [], products: [] });
    }, 'Вы вышли из панели.');
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      await apiRequest(`/admin/categories${editingCategoryId ? `/${editingCategoryId}` : ''}`, {
        method: editingCategoryId ? 'PUT' : 'POST',
        body: JSON.stringify(categoryForm),
      });
      await loadCatalog();
      await useMenuStore.getState().refresh();
      setCategoryForm(blankCategory);
      setEditingCategoryId(null);
    }, editingCategoryId ? 'Категория обновлена.' : 'Категория добавлена.');
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runAction(async () => {
      await apiRequest(`/admin/products${editingProductId ? `/${editingProductId}` : ''}`, {
        method: editingProductId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...productForm, imageUrl: productForm.imageUrl.trim() || null }),
      });
      await loadCatalog();
      await useMenuStore.getState().refresh();
      setProductForm(blankProduct(catalog.categories[0]?.id ?? ''));
      setEditingProductId(null);
      setImagePreview('');
    }, editingProductId ? 'Блюдо обновлено.' : 'Блюдо добавлено.');
  };

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImageUploadError('');
    if (file.size > 20 * 1024 * 1024) {
      setImageUploadError(t('admin.imageInputTooLarge'));
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setImageUploading(true);
    try {
      const compressed = await compressImage(file);
      const result = await uploadBinary<{ url: string }>('/admin/images', compressed);
      setProductForm((current) => ({ ...current, imageUrl: result.url }));
      setImagePreview(result.url);
    } catch (uploadError) {
      if (uploadError instanceof Error && uploadError.message === 'image-decode') {
        setImageUploadError(t('admin.imageDecodeError'));
      } else if (uploadError instanceof Error && uploadError.message === 'image-too-large') {
        setImageUploadError(t('admin.imageTooLarge'));
      } else {
        setImageUploadError(t('admin.imageUploadError'));
      }
    } finally {
      setImageUploading(false);
    }
  };

  const editCategory = (category: AdminCategory) => {
    setCategoryForm({
      nameRu: category.nameRu,
      nameEn: category.nameEn,
      active: category.active,
      sortOrder: category.sortOrder,
    });
    setEditingCategoryId(category.id);
  };

  const editProduct = (product: AdminProduct) => {
    setProductForm({
      categoryId: product.categoryId,
      nameRu: product.nameRu,
      nameEn: product.nameEn,
      descriptionRu: product.descriptionRu,
      descriptionEn: product.descriptionEn,
      priceKgs: product.priceKgs,
      imageUrl: product.imageUrl ?? '',
      available: product.available,
      active: product.active,
      sortOrder: product.sortOrder,
    });
    setImagePreview(product.imageUrl ?? '');
    setImageUploadError('');
    setEditingProductId(product.id);
  };

  const updateProduct = async (product: AdminProduct, changes: Partial<ProductForm>, successMessage: string) => {
    await runAction(async () => {
      await apiRequest(`/admin/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          categoryId: product.categoryId,
          nameRu: product.nameRu,
          nameEn: product.nameEn,
          descriptionRu: product.descriptionRu,
          descriptionEn: product.descriptionEn,
          priceKgs: product.priceKgs,
          imageUrl: product.imageUrl,
          available: product.available,
          active: product.active,
          sortOrder: product.sortOrder,
          ...changes,
        }),
      });
      await loadCatalog();
      await useMenuStore.getState().refresh();
    }, successMessage);
  };

  const removeProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Удалить блюдо «${product.nameRu}»?`)) return;
    await runAction(async () => {
      await apiRequest<void>(`/admin/products/${product.id}`, { method: 'DELETE' });
      await loadCatalog();
      await useMenuStore.getState().refresh();
    }, 'Блюдо удалено.');
  };

  const removeCategory = async (category: AdminCategory) => {
    if (!window.confirm(`Удалить категорию «${category.nameRu}»?`)) return;
    await runAction(async () => {
      await apiRequest<void>(`/admin/categories/${category.id}`, { method: 'DELETE' });
      await loadCatalog();
      await useMenuStore.getState().refresh();
    }, 'Категория удалена.');
  };

  if (checkingSession) {
    return <p className="px-5 py-16 text-center text-mute">Проверяем доступ…</p>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-brand">GAIJIN SUSHI</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl">Панель администратора</h1>
        </div>
        {authenticated && (
          <button type="button" disabled={busy} onClick={handleLogout} className="btn-secondary">
            <LogOut size={18} />
            Выйти
          </button>
        )}
      </div>

      {error && <p role="alert" className="mb-4 rounded-2xl bg-brand/10 px-4 py-3 font-semibold text-brand">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-2xl bg-green-500/10 px-4 py-3 font-semibold text-green-700">{notice}</p>}

      {!authenticated ? (
        <form onSubmit={handleLogin} className="mx-auto max-w-md rounded-3xl border border-line bg-surface p-5 sm:p-7">
          <h2 className="font-display text-xl">Вход</h2>
          <label className="mt-5 block text-sm font-bold">
            Логин
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-line bg-bg px-3 outline-none focus:border-brand"
            />
          </label>
          <label className="mt-4 block text-sm font-bold">
            Пароль
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-line bg-bg px-3 outline-none focus:border-brand"
            />
          </label>
          <button type="submit" disabled={busy} className="btn-primary mt-6 w-full">
            {busy ? 'Входим…' : 'Войти'}
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Категории</h2>
              <span className="text-sm text-mute">Вошли как {username}</span>
            </div>
            <form onSubmit={handleCategorySubmit} className="grid gap-3 sm:grid-cols-2">
              <input
                required
                aria-label="Название категории на русском"
                placeholder="Название на русском"
                value={categoryForm.nameRu}
                onChange={(event) => setCategoryForm({ ...categoryForm, nameRu: event.target.value })}
                className="admin-input"
              />
              <input
                required
                aria-label="Название категории на английском"
                placeholder="Название на английском"
                value={categoryForm.nameEn}
                onChange={(event) => setCategoryForm({ ...categoryForm, nameEn: event.target.value })}
                className="admin-input"
              />
              <label className="flex min-h-12 items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={categoryForm.active}
                  onChange={(event) => setCategoryForm({ ...categoryForm, active: event.target.checked })}
                />
                Показывать категорию в меню
              </label>
              <label className="admin-label">
                Порядок
                <input
                  type="number"
                  min="0"
                  value={categoryForm.sortOrder}
                  onChange={(event) => setCategoryForm({ ...categoryForm, sortOrder: Number(event.target.value) })}
                  className="admin-input"
                />
              </label>
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">
                  {editingCategoryId ? <Save size={18} /> : <Plus size={18} />}
                  {editingCategoryId ? 'Сохранить категорию' : 'Добавить категорию'}
                </button>
                {editingCategoryId && (
                  <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryForm(blankCategory); }} className="btn-secondary" aria-label="Отменить редактирование">
                    <X size={18} />
                  </button>
                )}
              </div>
            </form>
            <ul className="mt-5 divide-y divide-line">
              {catalog.categories.map((category) => (
                <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-bold">{category.nameRu} <span className="font-medium text-mute">/ {category.nameEn}</span></p>
                    <p className="text-xs text-mute">{category.active ? 'Опубликована' : 'Скрыта'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => editCategory(category)} className="btn-secondary min-h-10">Изменить</button>
                    <button type="button" disabled={busy} onClick={() => void removeCategory(category)} className="icon-btn !h-10 !w-10 text-brand" aria-label={`Удалить ${category.nameRu}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-4 sm:p-6">
            <h2 className="mb-5 font-display text-xl">{editingProductId ? 'Редактировать блюдо' : 'Добавить блюдо'}</h2>
            {catalog.categories.length === 0 ? (
              <p className="rounded-xl bg-brand/10 p-4 text-sm font-semibold text-brand">Сначала добавьте категорию.</p>
            ) : (
              <form onSubmit={handleProductSubmit} className="grid gap-3 sm:grid-cols-2">
                <label className="admin-label">
                  Название на русском
                  <input required value={productForm.nameRu} onChange={(event) => setProductForm({ ...productForm, nameRu: event.target.value })} className="admin-input" />
                </label>
                <label className="admin-label">
                  Название на английском
                  <input required value={productForm.nameEn} onChange={(event) => setProductForm({ ...productForm, nameEn: event.target.value })} className="admin-input" />
                </label>
                <label className="admin-label">
                  Описание на русском
                  <textarea rows={3} value={productForm.descriptionRu} onChange={(event) => setProductForm({ ...productForm, descriptionRu: event.target.value })} className="admin-input" />
                </label>
                <label className="admin-label">
                  Описание на английском
                  <textarea rows={3} value={productForm.descriptionEn} onChange={(event) => setProductForm({ ...productForm, descriptionEn: event.target.value })} className="admin-input" />
                </label>
                <label className="admin-label">
                  Цена (сом)
                  <input required type="number" min="1" step="1" value={productForm.priceKgs || ''} onChange={(event) => setProductForm({ ...productForm, priceKgs: Number(event.target.value) })} className="admin-input" />
                </label>
                <label className="admin-label">
                  Категория
                  <select required value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })} className="admin-input">
                    {catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.nameRu}</option>)}
                  </select>
                </label>
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={imageInput}
                      type="file"
                      accept="image/*"
                      onChange={(event) => void handleImageSelect(event)}
                      className="sr-only"
                      aria-label={t('admin.uploadImage')}
                    />
                    <button
                      type="button"
                      onClick={() => imageInput.current?.click()}
                      disabled={imageUploading}
                      className="btn-secondary min-h-12"
                    >
                      <ImagePlus size={19} />
                      {imageUploading ? t('admin.imageUploading') : t('admin.uploadImage')}
                    </button>
                    {imageUploading && <span role="status" className="text-sm text-mute">{t('admin.imageUploading')}</span>}
                  </div>
                  {imageUploadError && <p role="alert" className="text-sm font-semibold text-brand">{imageUploadError}</p>}
                  {(imagePreview || productForm.imageUrl) && (
                    <ProductImage
                      src={imagePreview || productForm.imageUrl}
                      alt={t('admin.imagePreview')}
                      className="h-40 w-full rounded-2xl sm:max-w-xs"
                    />
                  )}
                  <label className="admin-label">
                    Ссылка на фото
                    <input
                      type="text"
                      placeholder="https://… или /menu/photo.jpg"
                      value={productForm.imageUrl}
                      onChange={(event) => {
                        setProductForm({ ...productForm, imageUrl: event.target.value });
                        setImagePreview('');
                      }}
                      className="admin-input"
                    />
                  </label>
                </div>
                <label className="admin-label">
                  Порядок в меню
                  <input type="number" min="0" value={productForm.sortOrder} onChange={(event) => setProductForm({ ...productForm, sortOrder: Number(event.target.value) })} className="admin-input" />
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={productForm.available} onChange={(event) => setProductForm({ ...productForm, available: event.target.checked })} />
                  Блюдо доступно для заказа
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={productForm.active} onChange={(event) => setProductForm({ ...productForm, active: event.target.checked })} />
                  Показывать блюдо в меню
                </label>
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" disabled={busy || imageUploading} className="btn-primary flex-1">
                    {editingProductId ? <Save size={18} /> : <Plus size={18} />}
                    {editingProductId ? 'Сохранить блюдо' : 'Добавить блюдо'}
                  </button>
                  {editingProductId && (
                    <button type="button" onClick={() => { setEditingProductId(null); setProductForm(blankProduct(catalog.categories[0]?.id ?? '')); setImagePreview(''); setImageUploadError(''); }} className="btn-secondary" aria-label="Отменить редактирование">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="mt-6 space-y-3">
              {catalog.products.map((product) => (
                <article key={product.id} className="rounded-2xl border border-line bg-bg p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-extrabold">{product.nameRu} <span className="font-medium text-mute">/ {product.nameEn}</span></h3>
                      <p className="mt-1 text-sm text-mute">{product.category.nameRu} · {product.priceKgs.toLocaleString('ru-RU')} с</p>
                      <p className="mt-1 text-xs font-bold text-brand">
                        {!product.active ? 'Скрыто' : product.available ? 'Доступно' : 'Временно нет в наличии'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={busy} onClick={() => void updateProduct(product, { available: !product.available }, product.available ? 'Блюдо отмечено как временно недоступное.' : 'Блюдо снова доступно.')} className="btn-secondary min-h-10">
                        {product.available ? 'Нет в наличии' : 'Снова доступно'}
                      </button>
                      <button type="button" onClick={() => editProduct(product)} className="btn-secondary min-h-10">Изменить</button>
                      <button type="button" disabled={busy} onClick={() => void updateProduct(product, { active: !product.active }, product.active ? 'Блюдо скрыто из меню.' : 'Блюдо опубликовано.')} className="btn-secondary min-h-10">
                        {product.active ? 'Скрыть' : 'Показать'}
                      </button>
                      <button type="button" disabled={busy} onClick={() => void removeProduct(product)} className="icon-btn !h-10 !w-10 text-brand" aria-label={`Удалить ${product.nameRu}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
