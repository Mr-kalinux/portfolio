import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Get backend URL from environment
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Image Modal Component
const ImageModal = React.memo(({ isOpen, onClose, imageSrc, imageAlt }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="relative max-w-7xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
});

// Clickable Image Component
const ClickableImage = React.memo(({ src, alt, className, ...props }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  if (!src || hasError) {
    return (
      <div className={`${className} bg-gray-700 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Image non disponible</span>
      </div>
    );
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer transition-transform hover:scale-105 ${!isLoaded ? 'opacity-0' : 'opacity-100'}`}
        onClick={() => setIsModalOpen(true)}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        {...props}
      />
      <ImageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        imageSrc={src} 
        imageAlt={alt} 
      />
    </>
  );
});

// Toast Notification Component
const Toast = React.memo(({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
});

// Admin Context for inline editing
const AdminContext = createContext();

const AdminProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/verify`);
      setIsAdminAuthenticated(response.data?.authenticated || false);
    } catch (error) {
      setIsAdminAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (password) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { password });
      if (response.data?.success) {
        setIsAdminAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/api/admin/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAdminAuthenticated(false);
    setIsEditMode(false);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const saveData = useCallback(async (section, data) => {
    try {
      let endpoint;
      if (section === 'personal') {
        endpoint = '/api/admin/personal-info';
      } else if (section.startsWith('stage')) {
        endpoint = '/api/admin/stages';
        data = { [section]: data };
      } else {
        endpoint = `/api/admin/content/${section}`;
      }

      await axios.post(`${API_URL}${endpoint}`, data);
      return true;
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const contextValue = useMemo(() => ({
    isAdminAuthenticated,
    isEditMode,
    isLoading,
    login,
    logout,
    toggleEditMode,
    saveData
  }), [isAdminAuthenticated, isEditMode, isLoading, login, logout, toggleEditMode, saveData]);

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// EditableText component for inline editing
const EditableText = React.memo(({ value, onSave, className, placeholder, multiline = false }) => {
  const { isEditMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = useCallback(async () => {
    if (editValue.trim() === '') return;
    setIsSaving(true);
    try {
      const success = await onSave(editValue.trim());
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsSaving(false);
  }, [editValue, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value || '');
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel, multiline]);

  if (!isEditMode) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (isEditing) {
    const InputComponent = multiline ? 'textarea' : 'input';
    return (
      <div className="relative">
        <InputComponent
          type={multiline ? undefined : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${className} bg-gray-800 border border-cyan-400 rounded px-2 py-1 focus:outline-none focus:border-cyan-300 w-full`}
          placeholder={placeholder}
          rows={multiline ? 4 : undefined}
          autoFocus
        />
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || editValue.trim() === ''}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500 disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-gray-800 hover:bg-opacity-50 rounded px-1 border-2 border-dashed border-transparent hover:border-cyan-400 transition-colors`}
      onClick={() => setIsEditing(true)}
      title="Cliquez pour modifier"
    >
      {value || <span className="text-gray-500 italic">{placeholder}</span>}
    </span>
  );
});

// EditableImage component for inline image editing
const EditableImage = React.memo(({ src, alt, className, onSave, placeholder = "Cliquez pour ajouter une image" }) => {
  const { isEditMode } = useAdmin();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageClick = useCallback(() => {
    if (isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isEditMode]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const success = await onSave(response.data.image_url);
        if (!success) {
          alert('Erreur lors de la sauvegarde de l\'image');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  }, [onSave]);

  if (!isEditMode) {
    if (!src) {
      return (
        <div className={`${className} bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center`}>
          <span className="text-gray-400 text-xs text-center">{placeholder}</span>
        </div>
      );
    }
    return <ClickableImage src={src} alt={alt} className={className} />;
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        onClick={handleImageClick}
        className={`${className} cursor-pointer border-2 border-dashed border-transparent hover:border-cyan-400 transition-colors relative overflow-hidden rounded-lg`}
        title="Cliquez pour changer l'image"
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="bg-gray-700 w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center">{placeholder}</span>
          </div>
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">Upload en cours...</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-cyan-500 bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
});
const EditableList = React.memo(({ items, onSave, className, placeholder }) => {
  const { isEditMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState(items || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditItems(items || []);
  }, [items]);

  const handleSave = useCallback(async () => {
    const filteredItems = editItems.filter(item => item.trim() !== '');
    setIsSaving(true);
    try {
      const success = await onSave(filteredItems);
      if (success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsSaving(false);
  }, [editItems, onSave]);

  const addItem = useCallback(() => {
    setEditItems(prev => [...prev, '']);
  }, []);

  const removeItem = useCallback((index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index, value) => {
    setEditItems(prev => {
      const newItems = [...prev];
      newItems[index] = value;
      return newItems;
    });
  }, []);

  if (!isEditMode) {
    return (
      <div className={className}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30 mr-2 mb-2 inline-block">
              {item}
            </span>
          ))
        ) : (
          <span className="text-gray-500 italic">{placeholder}</span>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        {editItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-cyan-400 rounded text-white focus:outline-none focus:border-cyan-300"
              placeholder={`Élément ${index + 1}`}
            />
            <button
              onClick={() => removeItem(index)}
              className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-500"
        >
          + Ajouter
        </button>
        <div className="flex items-center space-x-2 mt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-500 disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} cursor-pointer hover:bg-gray-800 hover:bg-opacity-50 rounded px-2 py-1 border-2 border-dashed border-transparent hover:border-cyan-400 transition-colors`}
      onClick={() => setIsEditing(true)}
      title="Cliquez pour modifier"
    >
      {items && items.length > 0 ? (
        items.map((item, index) => (
          <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30 mr-2 mb-2 inline-block">
            {item}
          </span>
        ))
      ) : (
        <span className="text-gray-500 italic">{placeholder}</span>
      )}
    </div>
  );
});

// Admin Panel Component (floating toolbar)
const AdminPanel = React.memo(() => {
  const { isAdminAuthenticated, isEditMode, toggleEditMode, logout, isLoading } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return null;
  }

  if (!isAdminAuthenticated && !showLogin) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowLogin(true)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          🔧 Admin
        </button>
      </div>
    );
  }

  if (!isAdminAuthenticated && showLogin) {
    return <AdminLogin onClose={() => setShowLogin(false)} />;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-2 shadow-lg">
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleEditMode}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isEditMode 
              ? 'bg-green-600 text-white hover:bg-green-500' 
              : 'bg-cyan-600 text-white hover:bg-cyan-500'
          }`}
        >
          {isEditMode ? '✅ Mode Édition' : '✏️ Activer Édition'}
        </button>
        <button
          onClick={logout}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
        >
          Déconnexion
        </button>
      </div>
      {isEditMode && (
        <p className="text-xs text-gray-400">
          Cliquez sur les éléments pour les modifier
        </p>
      )}
    </div>
  );
});

// Admin Login Component
const AdminLogin = React.memo(({ onClose }) => {
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const success = await login(password);
    if (success) {
      onClose();
    } else {
      setError('Mot de passe incorrect');
    }
    setIsLoading(false);
  }, [password, login, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-600 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Connexion Admin</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe admin"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-cyan-400"
              required
              autoFocus
            />
          </div>
          {error && (
            <div className="mb-4 text-red-400 text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-500 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
});

// Optimized Hook for Data Fetching
const useDataFetcher = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url);
      setData(response.data);
    } catch (err) {
      setError(err);
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};

// Home Page Component
const HomePage = React.memo(() => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <AdminPanel />
      
      {/* Header */}
      <header className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Mon Portfolio
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Découvrez mon parcours professionnel à travers mes expériences et réalisations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/about"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              À propos de moi
            </Link>
            <Link
              to="/stage-premiere-annee"
              className="px-8 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold rounded-lg transition-all duration-300"
            >
              Voir mon parcours
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-cyan-400 mb-16">
            Explorez mon parcours
          </h2>
          
          {/* Navigation Buttons */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link to="/stage-premiere-annee" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-400 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20">
                <div className="text-cyan-400 text-4xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                <h3 className="text-2xl font-bold text-white mb-3">Stage 1ère Année</h3>
                <p className="text-gray-400">Découvrez mon premier stage professionnel</p>
              </div>
            </Link>
            
            <Link to="/stage-deuxieme-annee" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-400 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20">
                <div className="text-cyan-400 text-4xl mb-4 group-hover:scale-110 transition-transform">💼</div>
                <h3 className="text-2xl font-bold text-white mb-3">Stage 2ème Année</h3>
                <p className="text-gray-400">Mon évolution professionnelle</p>
              </div>
            </Link>
            
            <Link to="/conclusion" className="group">
              <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-400 rounded-xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20">
                <div className="text-cyan-400 text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-3">Conclusion</h3>
                <p className="text-gray-400">Bilan et perspectives d'avenir</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});

// About Page Component
const AboutPage = React.memo(() => {
  const { data: personalData } = useDataFetcher(`${API_URL}/api/personal-info`);
  const { saveData } = useAdmin();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      showToast('Message envoyé avec succès !', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      showToast('Erreur lors de l\'envoi du message', 'error');
    }
  }, [formData, showToast]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const updatePersonalData = useCallback((newData) => {
    // This would trigger a refetch or update the local state
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <AdminPanel />
      <Toast {...toast} onClose={hideToast} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              À propos de <span className="text-cyan-400">moi</span>
            </h1>
            <p className="text-xl text-gray-300">
              Découvrez mon profil et mes compétences
            </p>
          </div>

          {/* Profile Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">Profil</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nom</h3>
                    <EditableText
                      value={personalData?.name}
                      onSave={async (value) => {
                        const success = await saveData('personal', { ...personalData, name: value });
                        if (success) updatePersonalData({ name: value });
                        return success;
                      }}
                      className="text-gray-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                    <EditableText
                      value={personalData?.email}
                      onSave={async (value) => {
                        const success = await saveData('personal', { ...personalData, email: value });
                        if (success) updatePersonalData({ email: value });
                        return success;
                      }}
                      className="text-gray-300"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Téléphone</h3>
                    <EditableText
                      value={personalData?.phone}
                      onSave={async (value) => {
                        const success = await saveData('personal', { ...personalData, phone: value });
                        if (success) updatePersonalData({ phone: value });
                        return success;
                      }}
                      className="text-gray-300"
                      placeholder="Votre numéro de téléphone"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">LinkedIn</h3>
                    <EditableText
                      value={personalData?.linkedin}
                      onSave={async (value) => {
                        const success = await saveData('personal', { ...personalData, linkedin: value });
                        if (success) updatePersonalData({ linkedin: value });
                        return success;
                      }}
                      className="text-gray-300"
                      placeholder="Votre profil LinkedIn"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">Description</h2>
                <EditableText
                  value={personalData?.description}
                  onSave={async (value) => {
                    const success = await saveData('personal', { ...personalData, description: value });
                    if (success) updatePersonalData({ description: value });
                    return success;
                  }}
                  className="text-gray-300 leading-relaxed"
                  placeholder="Décrivez-vous en quelques mots..."
                  multiline={true}
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">Compétences</h2>
                <EditableList
                  items={personalData?.skills}
                  onSave={async (value) => {
                    const success = await saveData('personal', { ...personalData, skills: value });
                    if (success) updatePersonalData({ skills: value });
                    return success;
                  }}
                  placeholder="Cliquez pour ajouter des compétences"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Me contacter</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors duration-300"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

// Stage Premiere Annee Component with optimizations
const StagePremiereAnnee = React.memo(() => {
  const { data: stageData, loading, refetch } = useDataFetcher(`${API_URL}/api/stages/stage1`);
  const { saveData } = useAdmin();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const saveMission = useCallback(async (index, updatedMission) => {
    if (!stageData?.missions) return false;
    
    const newMissions = [...stageData.missions];
    newMissions[index] = updatedMission;
    const success = await saveData('stage1', { ...stageData, missions: newMissions });
    
    if (success) {
      showToast('Mission sauvegardée !', 'success');
      refetch();
    } else {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
    return success;
  }, [stageData, saveData, showToast, refetch]);

  const saveStageData = useCallback(async (field, value) => {
    const success = await saveData('stage1', { ...stageData, [field]: value });
    if (success) {
      showToast('Données sauvegardées !', 'success');
      refetch();
    } else {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
    return success;
  }, [stageData, saveData, showToast, refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Chargement...</div>
      </div>
    );
  }

  const displayData = stageData || {
    stage_type: "stage1",
    company: "[Nom de l'entreprise]",
    position: "[Intitulé du poste]",
    period: "[Date de début - Date de fin]",
    sector: "[Secteur d'activité]",
    description: "[Description de l'entreprise]",
    company_logo: "",
    workplace_image: "",
    tools: [
      {"name": "Outil 1", "image": ""},
      {"name": "Outil 2", "image": ""},
      {"name": "Outil 3", "image": ""},
      {"name": "Outil 4", "image": ""},
      {"name": "Outil 5", "image": ""},
      {"name": "Outil 6", "image": ""}
    ],
    building_plans: ["", "", "", ""],
    missions: [
      {
        title: "[Titre de votre mission]",
        description: "[Description de la mission]",
        skills: ["Compétence 1", "Compétence 2", "Compétence 3"],
        images: ["", "", ""]
      },
      {
        title: "[Titre de votre mission]",
        description: "[Description de la mission]",
        points: ["Point important 1", "Point important 2", "Point important 3"],
        images: ["", "", ""]
      },
      {
        title: "[Titre de votre mission]",
        description: "[Description de la mission]",
        skills: ["Compétence avancée 1", "Compétence avancée 2", "Compétence avancée 3"],
        images: ["", "", ""]
      }
    ],
    skills: ["Compétence technique 1", "Compétence technique 2", "Compétence technique 3"],
    learnings: "Ce stage m'a permis de découvrir le monde professionnel et de développer des compétences essentielles."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <AdminPanel />
      <Toast {...toast} onClose={hideToast} />
      
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            Stage <span className="text-cyan-400">1ère année</span>
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">Présentation du stage</h2>
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Informations générales</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Entreprise</h4>
                  <EditableText
                    value={displayData.company}
                    onSave={(value) => saveStageData('company', value)}
                    className="text-gray-300"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Période</h4>
                  <EditableText
                    value={displayData.period}
                    onSave={(value) => saveStageData('period', value)}
                    className="text-gray-300"
                    placeholder="Date de début - Date de fin"
                  />
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Poste</h4>
                  <EditableText
                    value={displayData.position}
                    onSave={(value) => saveStageData('position', value)}
                    className="text-gray-300"
                    placeholder="Intitulé du poste"
                  />
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Secteur</h4>
                  <EditableText
                    value={displayData.sector}
                    onSave={(value) => saveStageData('sector', value)}
                    className="text-gray-300"
                    placeholder="Secteur d'activité"
                  />
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-cyan-400 mb-4">À propos de l'entreprise</h4>
                <EditableText
                  value={displayData.description}
                  onSave={(value) => saveStageData('description', value)}
                  className="text-gray-300 leading-relaxed text-lg"
                  placeholder="Description de l'entreprise"
                  multiline={true}
                />
              </div>
            </div>

            {/* Section Photos d'entreprise */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Environnement de travail</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-cyan-400">Logo/Identité visuelle</h4>
                  <EditableImage
                    src={displayData.company_logo}
                    alt="Logo de l'entreprise"
                    className="h-40 w-full"
                    onSave={(imageUrl) => saveStageData('company_logo', imageUrl)}
                    placeholder="Logo de\nl'entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-cyan-400">Lieu de travail</h4>
                  <EditableImage
                    src={displayData.workplace_image}
                    alt="Lieu de travail"
                    className="h-40 w-full"
                    onSave={(imageUrl) => saveStageData('workplace_image', imageUrl)}
                    placeholder="Lieu de\ntravail"
                  />
                </div>
              </div>
            </div>

            {/* Section Outils utilisés */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Outils et technologies utilisés</h3>
              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-4">Technologies principales</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="space-y-2">
                      <EditableImage
                        src={displayData.tools?.[index]?.image}
                        alt={displayData.tools?.[index]?.name || `Outil ${index + 1}`}
                        className="h-20 w-20"
                        onSave={(imageUrl) => {
                          const newTools = [...(displayData.tools || [])];
                          if (!newTools[index]) newTools[index] = {};
                          newTools[index].image = imageUrl;
                          return saveStageData('tools', newTools);
                        }}
                        placeholder={`Outil ${index + 1}`}
                      />
                      <EditableText
                        value={displayData.tools?.[index]?.name}
                        onSave={(value) => {
                          const newTools = [...(displayData.tools || [])];
                          if (!newTools[index]) newTools[index] = {};
                          newTools[index].name = value;
                          return saveStageData('tools', newTools);
                        }}
                        className="text-xs text-gray-300 text-center block"
                        placeholder="Nom de l'outil"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Plans et espaces */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Plans et espaces de travail</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium text-cyan-400">
                      {index === 0 ? "Plan du bâtiment" : 
                       index === 1 ? "Espace de travail" : 
                       index === 2 ? "Salle de réunion" : 
                       "Zone commune"}
                    </h4>
                    <EditableImage
                      src={displayData.building_plans?.[index]}
                      alt={`Plan ${index + 1}`}
                      className="h-40 w-full"
                      onSave={(imageUrl) => {
                        const newPlans = [...(displayData.building_plans || [])];
                        newPlans[index] = imageUrl;
                        return saveStageData('building_plans', newPlans);
                      }}
                      placeholder={index === 0 ? "Plan du\nbâtiment" : 
                                   index === 1 ? "Espace de\ntravail" : 
                                   index === 2 ? "Salle de\nréunion" : 
                                   "Zone\ncommune"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">Missions réalisées</h2>
            
            {displayData.missions.map((mission, index) => (
              <div key={index} className="mb-12 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-white">
                    Mission {index + 1} - 
                    <EditableText
                      value={mission.title}
                      onSave={(value) => saveMission(index, { ...mission, title: value })}
                      className="text-white ml-2"
                      placeholder="Titre de la mission"
                    />
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Description détaillée</h4>
                      <EditableText
                        value={mission.description}
                        onSave={(value) => saveMission(index, { ...mission, description: value })}
                        className="text-gray-300 leading-relaxed text-base"
                        placeholder="Description de la mission"
                        multiline={true}
                      />
                    </div>
                    
                    {(mission.skills || index === 0 || index === 2) && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">
                          {index === 2 ? 'Compétences avancées :' : 'Compétences mobilisées :'}
                        </h4>
                        <EditableList
                          items={mission.skills}
                          onSave={(value) => saveMission(index, { ...mission, skills: value })}
                          placeholder="Cliquez pour ajouter des compétences"
                        />
                      </div>
                    )}
                    
                    {mission.points && index === 1 && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Étapes clés de réalisation :</h4>
                        <div className="space-y-3">
                          {mission.points.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-start space-x-3 bg-gray-800/50 rounded-lg p-3">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <EditableText
                                  value={point}
                                  onSave={(value) => {
                                    const newPoints = [...mission.points];
                                    newPoints[pointIndex] = value;
                                    return saveMission(index, { ...mission, points: newPoints });
                                  }}
                                  className="text-gray-300 text-sm leading-relaxed"
                                  placeholder="Point clé"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-cyan-400">Documentation visuelle :</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[0, 1, 2].map((imgIndex) => (
                        <div key={imgIndex} className={`space-y-2 ${imgIndex === 2 ? 'col-span-2' : ''}`}>
                          <h5 className="text-xs text-cyan-300">
                            {imgIndex === 0 ? "Capture d'écran/Schéma" : imgIndex === 1 ? "Résultat/Livrable" : "Documentation/Process"}
                          </h5>
                          <EditableImage
                            src={mission.images?.[imgIndex]}
                            alt={`Mission ${index + 1} - ${imgIndex === 0 ? "Capture d'écran" : imgIndex === 1 ? "Résultat" : "Documentation"}`}
                            className={`h-32 w-full`}
                            onSave={(imageUrl) => {
                              const newImages = [...(mission.images || [])];
                              newImages[imgIndex] = imageUrl;
                              return saveMission(index, { ...mission, images: newImages });
                            }}
                            placeholder={imgIndex === 0 ? "Capture d'écran\nou schéma" : imgIndex === 1 ? "Résultat\nou livrable" : "Documentation\nou process"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Bilan du stage</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Compétences développées</h3>
                <EditableList
                  items={displayData.skills}
                  onSave={(value) => saveStageData('skills', value)}
                  placeholder="Cliquez pour ajouter des compétences"
                />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Apprentissages clés</h3>
                <EditableText
                  value={displayData.learnings}
                  onSave={(value) => saveStageData('learnings', value)}
                  className="text-gray-300 leading-relaxed"
                  placeholder="Décrivez vos apprentissages clés"
                  multiline={true}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              Premier pas vers l'expertise
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Cette première expérience professionnelle a posé les bases de mon développement en tant que futur expert.
            </p>
            <Link to="/about" className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors duration-300">
              Me contacter
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

// Stage Deuxieme Annee Component
const StageDeuxiemeAnnee = React.memo(() => {
  const { data: stageData, loading } = useDataFetcher(`${API_URL}/api/stages/stage2`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <AdminPanel />
      
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1560472354-b33ff0c44a43)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            Stage <span className="text-cyan-400">2ème année</span>
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">
              Contenu en cours de développement
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Cette section sera bientôt disponible avec le détail de mon stage de 2ème année.
            </p>
            <Link 
              to="/stage-premiere-annee" 
              className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors duration-300"
            >
              Voir le stage 1ère année
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

// Conclusion Page Component
const ConclusionPage = React.memo(() => {
  const { data: conclusionData, loading } = useDataFetcher(`${API_URL}/api/content/conclusion`);
  const { saveData } = useAdmin();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const saveConclusionData = useCallback(async (field, value) => {
    const success = await saveData('conclusion', { ...conclusionData, [field]: value });
    if (success) {
      showToast('Contenu sauvegardé !', 'success');
    } else {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
    return success;
  }, [conclusionData, saveData, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">Chargement...</div>
      </div>
    );
  }

  const displayData = conclusionData || {
    title: "Bilan et perspectives",
    content: "Mon parcours professionnel m'a permis d'acquérir de nombreuses compétences et expériences qui m'orientent vers un avenir prometteur.",
    goals: ["Objectif 1", "Objectif 2", "Objectif 3"]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <AdminPanel />
      <Toast {...toast} onClose={hideToast} />
      
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            <span className="text-cyan-400">Conclusion</span>
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">
              <EditableText
                value={displayData.title}
                onSave={(value) => saveConclusionData('title', value)}
                className="text-3xl font-bold text-cyan-400"
                placeholder="Titre de la conclusion"
              />
            </h2>
            
            <div className="mb-8">
              <EditableText
                value={displayData.content}
                onSave={(value) => saveConclusionData('content', value)}
                className="text-gray-300 leading-relaxed text-lg"
                placeholder="Contenu de votre conclusion..."
                multiline={true}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Objectifs futurs</h3>
              <EditableList
                items={displayData.goals}
                onSave={(value) => saveConclusionData('goals', value)}
                placeholder="Cliquez pour ajouter vos objectifs"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              Merci de votre attention
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              N'hésitez pas à me contacter pour discuter de mon parcours ou d'opportunités de collaboration.
            </p>
            <Link to="/about" className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors duration-300">
              Me contacter
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

// Main App Component
function App() {
  return (
    <Router>
      <AdminProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/stage-premiere-annee" element={<StagePremiereAnnee />} />
          <Route path="/stage-deuxieme-annee" element={<StageDeuxiemeAnnee />} />
          <Route path="/conclusion" element={<ConclusionPage />} />
        </Routes>
      </AdminProvider>
    </Router>
  );
}

export default App;