import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, EyeOff, GripVertical } from 'lucide-react';
import { API_BASE_URL } from '../../../config/constants';
import '../AdminSubPages.css';

type ContentType = 'collection_card' | 'news_banner' | 'ad_card';

interface ContentItem {
  id?: string;
  type: ContentType;
  title: string;
  description: string;
  icon: string;
  image: string;
  link: string;
  badgeText: string;
  isActive: boolean;
  sortOrder: number;
  metadata: Record<string, any>;
}

const EMPTY_ITEM: Omit<ContentItem, 'type'> = {
  title: '',
  description: '',
  icon: '',
  image: '',
  link: '',
  badgeText: '',
  isActive: true,
  sortOrder: 0,
  metadata: {},
};

export const ContentManagementPage = () => {
  const [activeTab, setActiveTab] = useState<ContentType>('collection_card');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const token = localStorage.getItem('arlink_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const tabs: { key: ContentType; label: string }[] = [
    { key: 'collection_card', label: 'Collections (Homepage)' },
    { key: 'news_banner', label: 'Banni\u00e8re News' },
    { key: 'ad_card', label: 'Cartes Pub (Inscription)' },
  ];

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/platform-content/by-type?type=${activeTab}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: ContentItem) => {
    setSaving(true);
    setMessage(null);
    try {
      const url = item.id
        ? `${API_BASE_URL}/platform-content/${item.id}`
        : `${API_BASE_URL}/platform-content`;
      const method = item.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ ...item, type: activeTab }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contenu sauvegard\u00e9 !' });
        fetchItems();
      } else {
        const err = await response.json();
        setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('\u00cates-vous s\u00fbr de vouloir supprimer cet \u00e9l\u00e9ment ?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/platform-content/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (response.ok) {
        setMessage({ type: 'success', text: '\u00c9l\u00e9ment supprim\u00e9' });
        fetchItems();
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleAdd = () => {
    setItems([...items, { ...EMPTY_ITEM, type: activeTab, sortOrder: items.length }]);
  };

  const updateItem = (index: number, field: keyof ContentItem, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const renderFields = (item: ContentItem, index: number) => {
    switch (activeTab) {
      case 'collection_card':
        return (
          <div className="content-form-grid">
            <div className="form-field">
              <label>Titre</label>
              <input value={item.title} onChange={(e) => updateItem(index, 'title', e.target.value)} placeholder="Ex: Cuir du Monde" />
            </div>
            <div className="form-field">
              <label>Ic\u00f4ne (emoji)</label>
              <input value={item.icon} onChange={(e) => updateItem(index, 'icon', e.target.value)} placeholder="Ex: \ud83d\udc5c" />
            </div>
            <div className="form-field">
              <label>Description</label>
              <input value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Description courte" />
            </div>
            <div className="form-field">
              <label>Image URL</label>
              <input value={item.image} onChange={(e) => updateItem(index, 'image', e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-field">
              <label>Lien</label>
              <input value={item.link} onChange={(e) => updateItem(index, 'link', e.target.value)} placeholder="/category/cuir" />
            </div>
            <div className="form-field">
              <label>Nombre de cr\u00e9ations</label>
              <input type="number" value={item.metadata?.count || 0} onChange={(e) => updateItem(index, 'metadata', { ...item.metadata, count: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
        );
      case 'news_banner':
        return (
          <div className="content-form-grid">
            <div className="form-field full-width">
              <label>Texte de la banni\u00e8re</label>
              <input value={item.title} onChange={(e) => updateItem(index, 'title', e.target.value)} placeholder="Ex: \u2728 L'Exposition Mondiale de l'Artisanat \u2013 D\u00e9couvrez les boutiques vedettes \u2728" />
            </div>
            <div className="form-field">
              <label>Lien (optionnel)</label>
              <input value={item.link} onChange={(e) => updateItem(index, 'link', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        );
      case 'ad_card':
        return (
          <div className="content-form-grid">
            <div className="form-field">
              <label>Titre</label>
              <input value={item.title} onChange={(e) => updateItem(index, 'title', e.target.value)} placeholder="Ex: Artisans du Monde" />
            </div>
            <div className="form-field">
              <label>Ic\u00f4ne (palette/shopping-bag/gem/sun)</label>
              <input value={item.icon} onChange={(e) => updateItem(index, 'icon', e.target.value)} placeholder="palette" />
            </div>
            <div className="form-field full-width">
              <label>Description</label>
              <textarea value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Description de la carte" rows={3} />
            </div>
            <div className="form-field">
              <label>Badge</label>
              <input value={item.badgeText} onChange={(e) => updateItem(index, 'badgeText', e.target.value)} placeholder="Ex: 20M+ ARTISANS" />
            </div>
            <div className="form-field">
              <label>Lien</label>
              <input value={item.link} onChange={(e) => updateItem(index, 'link', e.target.value)} placeholder="/page-pub" />
            </div>
            <div className="form-field">
              <label>Image URL (optionnel)</label>
              <input value={item.image} onChange={(e) => updateItem(index, 'image', e.target.value)} placeholder="https://..." />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-subpage content-management">
      <div className="subpage-header">
        <h1>Gestion du Contenu</h1>
        <p>G\u00e9rez les collections, la banni\u00e8re et les cartes pub de la plateforme</p>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`content-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      ) : (
        <div className="content-items">
          {items.map((item, index) => (
            <div key={item.id || `new-${index}`} className="content-item-card">
              <div className="content-item-header">
                <span className="content-item-grip"><GripVertical size={16} /></span>
                <span className="content-item-title">{item.title || '(Nouveau)'}</span>
                <div className="content-item-actions">
                  <button
                    className={`btn-toggle ${item.isActive ? 'active' : ''}`}
                    onClick={() => updateItem(index, 'isActive', !item.isActive)}
                    title={item.isActive ? 'D\u00e9sactiver' : 'Activer'}
                  >
                    {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    className="btn-save"
                    onClick={() => handleSave(item)}
                    disabled={saving}
                  >
                    <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  {item.id && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(item.id!)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              {renderFields(item, index)}
            </div>
          ))}

          <button className="btn-add-content" onClick={handleAdd}>
            <Plus size={18} /> Ajouter un \u00e9l\u00e9ment
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentManagementPage;
