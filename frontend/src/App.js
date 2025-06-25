import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Get backend URL from environment
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Image Modal Component
const ImageModal = ({ isOpen, onClose, imageSrc, imageAlt }) => {
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
};

// Clickable Image Component
const ClickableImage = ({ src, alt, className, style }) => {
  const [modalOpen, setModalOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
        style={style}
        onClick={() => setModalOpen(true)}
      />
      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageSrc={src}
        imageAlt={alt}
      />
    </>
  );
};

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-center space-x-2">
        {type === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-75">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Admin context for managing authentication
const AdminContext = React.createContext();

// Admin Auth Provider
const AdminProvider = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (adminToken) {
      verifyAdminToken();
    }
  }, [adminToken]);

  const verifyAdminToken = async () => {
    try {
      await axios.get(`${API_URL}/api/admin/verify`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setIsAdminAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      setIsAdminAuthenticated(false);
    }
  };

  const adminLogin = async (password) => {
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { password });
      const token = response.data.token;
      localStorage.setItem('adminToken', token);
      setAdminToken(token);
      setIsAdminAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const adminLogout = async () => {
    try {
      if (adminToken) {
        await axios.post(`${API_URL}/api/admin/logout`, {}, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      setIsAdminAuthenticated(false);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      adminToken,
      adminLogin,
      adminLogout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook to use admin context
const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Components for each page
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1462396240927-52058a6a84ec)'
          }}
        ></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-6xl font-bold text-white mb-6">
            Mon <span className="text-cyan-400">Portfolio</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Découvrez mon parcours professionnel à travers mes stages de fin d'années
          </p>
          
          {/* Navigation Buttons */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
          
          <div className="mt-12">
            <Link to="/about" className="inline-flex items-center px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition-colors duration-300">
              À propos de moi
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  const [personalInfo, setPersonalInfo] = useState(null);

  useEffect(() => {
    fetchPersonalInfo();
  }, []);

  const fetchPersonalInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/personal-info`);
      setPersonalInfo(response.data);
    } catch (error) {
      console.error('Error fetching personal info:', error);
      // Set default data if API fails
      setPersonalInfo({
        name: "Votre Nom",
        email: "votre.email@exemple.com",
        phone: "+33 X XX XX XX XX",
        linkedin: "/votre-profil",
        description: "Étudiant(e) motivé(e) et passionné(e), je poursuis actuellement mes études en [Votre Domaine d'Études]. À travers mes stages, j'ai développé des compétences solides et une vision claire de mon avenir professionnel.",
        skills: ["Compétence 1", "Compétence 2", "Compétence 3", "Compétence 4", "Compétence 5"],
        profile_image: ""
      });
    }
  };

  if (!personalInfo) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-cyan-400 text-xl">Chargement...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8">
            À <span className="text-cyan-400">propos</span> de moi
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ClickableImage
                src={personalInfo.profile_image || 'https://images.unsplash.com/photo-1555212697-194d092e3b8f'}
                alt="Profile"
                className="rounded-xl bg-cover bg-center h-96 border border-gray-700 w-full object-cover"
              />
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Profil</h3>
                <p className="text-gray-300 leading-relaxed">
                  {personalInfo.description}
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {personalInfo.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Contact</h3>
                <div className="space-y-2 text-gray-300">
                  <p>📧 {personalInfo.email}</p>
                  <p>📱 {personalInfo.phone}</p>
                  <p>🌐 LinkedIn: {personalInfo.linkedin}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StagePremiereAnnee = () => {
  const [stageData, setStageData] = useState(null);

  useEffect(() => {
    fetchStageData();
  }, []);

  const fetchStageData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stages/stage1`);
      const data = response.data;
      
      // S'assurer qu'il y a toujours 3 missions
      const defaultMissions = [
        {
          title: "[Titre de votre mission]",
          description: "[Décrivez ici votre première mission principale. Expliquez le contexte, vos responsabilités, les défis rencontrés et les résultats obtenus. Cette section peut contenir plusieurs paragraphes pour détailler votre expérience.]",
          skills: ["Compétence 1", "Compétence 2", "Compétence 3"],
          images: []
        },
        {
          title: "[Titre de votre mission]",
          description: "[Décrivez ici votre deuxième mission principale. Mettez l'accent sur l'évolution par rapport à la première mission, les nouvelles responsabilités et les apprentissages spécifiques à cette mission.]",
          points: ["Point important 1", "Point important 2", "Point important 3"],
          images: []
        },
        {
          title: "[Titre de votre mission]",
          description: "[Présentez votre troisième mission principale. Développez vos nouvelles compétences acquises et l'évolution de votre expertise professionnelle.]",
          skills: ["Compétence avancée 1", "Compétence avancée 2", "Compétence avancée 3"],
          images: []
        }
      ];
      
      // Compléter avec les missions par défaut si nécessaire
      const missions = [...(data.missions || [])];
      while (missions.length < 3) {
        missions.push(defaultMissions[missions.length]);
      }
      // Limiter à 3 missions maximum
      missions.splice(3);
      
      setStageData({
        ...data,
        missions: missions
      });
    } catch (error) {
      console.error('Error fetching stage data:', error);
      // Set default data if API fails
      setStageData({
        stage_type: "stage1",
        company: "[Nom de l'entreprise]",
        position: "[Intitulé du poste]",
        period: "[Date de début - Date de fin]",
        sector: "[Secteur d'activité]",
        description: "[Ajoutez ici une description de l'entreprise, son secteur d'activité, sa taille, ses valeurs, et le contexte dans lequel vous avez évolué pendant votre stage.]",
        missions: [
          {
            title: "[Titre de votre mission]",
            description: "[Décrivez ici votre première mission principale. Expliquez le contexte, vos responsabilités, les défis rencontrés et les résultats obtenus. Cette section peut contenir plusieurs paragraphes pour détailler votre expérience.]",
            skills: ["Compétence 1", "Compétence 2", "Compétence 3"],
            images: []
          },
          {
            title: "[Titre de votre mission]",
            description: "[Décrivez ici votre deuxième mission principale. Mettez l'accent sur l'évolution par rapport à la première mission, les nouvelles responsabilités et les apprentissages spécifiques à cette mission.]",
            points: ["Point important 1", "Point important 2", "Point important 3"],
            images: []
          },
          {
            title: "[Titre de votre mission]",
            description: "[Présentez votre troisième mission principale. Soulignez l'impact de cette mission sur votre développement professionnel et les résultats concrets que vous avez obtenus.]",
            results: { improvement: "XX%", projects: "XX" },
            images: []
          },
          {
            title: "[Titre de votre mission]",
            description: "[Décrivez ici votre quatrième mission ou mission spécialisée. Mettez en avant les aspects innovants, les défis techniques ou les compétences avancées développées dans cette mission.]",
            achievements: ["Réalisation 1", "Réalisation 2", "Réalisation 3"],
            images: []
          }
        ],
        skills: ["Compétence technique 1", "Compétence technique 2", "Compétence technique 3"],
        achievements: [],
        images: []
      });
    }
  };

  if (!stageData) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="text-cyan-400 text-xl">Chargement...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488590528505-98d2b5aba04b)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            Stage <span className="text-cyan-400">1ère Année</span>
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">Présentation de l'entreprise</h2>
            
            {/* Informations de base */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Informations générales</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Entreprise</h4>
                  <p className="text-gray-300">{stageData.company}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Période</h4>
                  <p className="text-gray-300">{stageData.period}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Poste</h4>
                  <p className="text-gray-300">{stageData.position}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-2">Secteur</h4>
                  <p className="text-gray-300">{stageData.sector}</p>
                </div>
              </div>
              
              <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-cyan-400 mb-4">À propos de l'entreprise</h4>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {stageData.description}
                </p>
              </div>
            </div>

            {/* Section Photos d'entreprise */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Identité visuelle</h3>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                {stageData.images.slice(0, 2).map((image, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="text-sm font-medium text-cyan-400">
                      {index === 0 ? "Logo de l'entreprise" : "Façade/Bâtiment"}
                    </h4>
                    <ClickableImage
                      src={image}
                      alt={index === 0 ? "Logo de l'entreprise" : "Façade/Bâtiment"}
                      className="rounded-lg h-40 w-full object-cover border border-gray-600 hover:border-cyan-400 transition-colors"
                    />
                  </div>
                ))}
                {stageData.images.length < 2 && Array.from({length: 2 - stageData.images.length}).map((_, index) => (
                  <div key={`placeholder-${index}`} className="space-y-2">
                    <h4 className="text-sm font-medium text-cyan-400">
                      {index === 0 ? "Logo de l'entreprise" : "Façade/Bâtiment"}
                    </h4>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-40 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-xs text-center">
                        {index === 0 ? "Logo de\nl'entreprise" : "Façade/\nBâtiment"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nouvelle section : Découvertes & Environnement */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Découvertes & Environnement</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Durant ce stage, j'ai eu l'opportunité de découvrir l'écosystème technologique de l'entreprise, 
                ses équipes, ses outils de travail et son organisation.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Plans & Organisation */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-white">Plans & Organisation</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Plans des locaux, organigrammes, structure des équipes</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-xs text-center">Plan des\nlocaux</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-xs text-center">Organigramme</span>
                    </div>
                  </div>
                </div>

                {/* Bureaux & Espaces */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-white">Bureaux & Espaces</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Mon poste de travail, salles de réunion, espaces collaboratifs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {stageData.images.slice(2, 4).map((image, index) => (
                      <ClickableImage
                        key={index}
                        src={image}
                        alt={index === 0 ? "Mon poste de travail" : "Salles de réunion"}
                        className="rounded-lg h-24 w-full object-cover border border-gray-600 hover:border-cyan-400 transition-colors"
                      />
                    ))}
                    {stageData.images.slice(2, 4).length < 2 && Array.from({length: 2 - stageData.images.slice(2, 4).length}).map((_, index) => (
                      <div key={`bureaux-placeholder-${index}`} className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                        <span className="text-gray-400 text-xs text-center">
                          {index === 0 ? "Mon poste\nde travail" : "Salles de\nréunion"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Équipement informatique */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-white">Équipement informatique</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Matériel utilisé, configurations, équipements techniques</p>
                  <div className="grid grid-cols-2 gap-2">
                    {stageData.images.slice(4, 6).map((image, index) => (
                      <ClickableImage
                        key={index}
                        src={image}
                        alt={index === 0 ? "Poste de travail" : "Équipements techniques"}
                        className="rounded-lg h-24 w-full object-cover border border-gray-600 hover:border-cyan-400 transition-colors"
                      />
                    ))}
                    {stageData.images.slice(4, 6).length < 2 && Array.from({length: 2 - stageData.images.slice(4, 6).length}).map((_, index) => (
                      <div key={`equipement-placeholder-${index}`} className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                        <span className="text-gray-400 text-xs text-center">
                          {index === 0 ? "Poste de\ntravail" : "Équipements\ntechniques"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personnel de l'entreprise */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-white">Personnel de l'entreprise</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Équipes, collègues, encadrants, collaborateurs</p>
                  <div className="grid grid-cols-2 gap-2">
                    {stageData.images.slice(6, 8).map((image, index) => (
                      <ClickableImage
                        key={index}
                        src={image}
                        alt={index === 0 ? "Équipe/Collègues" : "Encadrants/Managers"}
                        className="rounded-lg h-24 w-full object-cover border border-gray-600 hover:border-cyan-400 transition-colors"
                      />
                    ))}
                    {stageData.images.slice(6, 8).length < 2 && Array.from({length: 2 - stageData.images.slice(6, 8).length}).map((_, index) => (
                      <div key={`personnel-placeholder-${index}`} className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                        <span className="text-gray-400 text-xs text-center">
                          {index === 0 ? "Équipe/\nCollègues" : "Encadrants/\nManagers"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Applications découvertes */}
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 md:col-span-2 lg:col-span-4">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                    <h4 className="text-lg font-semibold text-white">Applications & Technologies découvertes</h4>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Logiciels, plateformes et technologies que j'ai découvertes et utilisées</p>
                  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {stageData.images.slice(8, 14).map((image, index) => (
                      <ClickableImage
                        key={index}
                        src={image}
                        alt={`Application/Technologie ${index + 1}`}
                        className="rounded-lg h-24 w-full object-cover border border-gray-600 hover:border-cyan-400 transition-colors"
                      />
                    ))}
                    {stageData.images.slice(8, 14).length < 6 && Array.from({length: 6 - stageData.images.slice(8, 14).length}).map((_, index) => (
                      <div key={`app-placeholder-${index}`} className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                        <span className="text-gray-400 text-xs text-center">
                          {index === 0 ? "Application\n1" : index === 1 ? "Application\n2" : index === 2 ? "Plateforme\nA" : index === 3 ? "Plateforme\nB" : index === 4 ? "Outil\nmétier" : "Technologie\ndécouverte"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">Missions réalisées</h2>
            
            {stageData.missions.map((mission, index) => (
              <div key={index} className="mb-12 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                  <h3 className="text-2xl font-bold text-white">Mission {index + 1} - {mission.title}</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-cyan-400 mb-3">Description détaillée</h4>
                      <p className="text-gray-300 leading-relaxed text-base">
                        {mission.description}
                      </p>
                    </div>
                    
                    {mission.skills && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Compétences mobilisées :</h4>
                        <div className="flex flex-wrap gap-2">
                          {mission.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mission.points && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Étapes clés de réalisation :</h4>
                        <div className="space-y-3">
                          {mission.points.map((point, pointIndex) => (
                            <div key={pointIndex} className="flex items-start space-x-3 bg-gray-800/50 rounded-lg p-3">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-gray-300 text-sm leading-relaxed">{point}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mission.results && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Impact et résultats :</h4>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-6 text-center">
                            <div className="space-y-2">
                              <div className="text-3xl font-bold text-cyan-400">{mission.results.improvement}</div>
                              <div className="text-gray-400 text-sm">Amélioration mesurée</div>
                            </div>
                            <div className="space-y-2">
                              <div className="text-3xl font-bold text-cyan-400">{mission.results.projects}</div>
                              <div className="text-gray-400 text-sm">Projets réalisés</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <p className="text-gray-300 text-sm text-center">
                              Cette mission a permis d'obtenir des résultats concrets et mesurables
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {mission.achievements && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-semibold text-cyan-400">Réalisations principales :</h4>
                        <div className="space-y-3">
                          {mission.achievements.map((achievement, achievementIndex) => (
                            <div key={achievementIndex} className="flex items-start space-x-3 bg-gray-800/50 rounded-lg p-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="text-gray-300 text-sm leading-relaxed">{achievement}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ajout d'une section apprentissages */}
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-cyan-400">Apprentissages clés :</h4>
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span className="text-gray-300 text-sm">Découverte des processus métier de l'entreprise</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span className="text-gray-300 text-sm">Maîtrise des outils et technologies utilisés</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span className="text-gray-300 text-sm">Développement de l'autonomie et de la rigueur</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-cyan-400">Documentation visuelle :</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {mission.images && mission.images.slice(0, 3).map((image, imgIndex) => (
                        <ClickableImage
                          key={imgIndex}
                          src={image}
                          alt={`Mission ${index + 1} - Photo ${imgIndex + 1}`}
                          className={`rounded-lg h-32 object-cover border border-gray-600 w-full hover:border-cyan-400 transition-colors ${imgIndex === 2 ? 'col-span-2' : ''}`}
                        />
                      ))}
                      {(!mission.images || mission.images.length < 3) && Array.from({length: 3 - (mission.images?.length || 0)}).map((_, imgIndex) => (
                        <div key={`placeholder-${imgIndex}`} className={`bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors ${imgIndex === 2 ? 'col-span-2' : ''}`}>
                          <span className="text-gray-400 text-xs text-center">
                            {imgIndex === 0 ? "Capture d'écran\nou schéma" : imgIndex === 1 ? "Résultat\nou livrable" : "Documentation\nou process"}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Ajout d'une section défis rencontrés */}
                    <div className="mt-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
                      <h5 className="text-orange-400 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                        Défis rencontrés
                      </h5>
                      <p className="text-gray-300 text-sm">
                        [Décrivez les principales difficultés rencontrées dans cette mission et comment vous les avez surmontées]
                      </p>
                    </div>

                    {/* Ajout d'une section outils utilisés */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                      <h5 className="text-cyan-400 font-semibold mb-2 flex items-center">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                        Outils & Technologies
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Outil 1</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Outil 2</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Outil 3</span>
                      </div>
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
                <h3 className="text-xl font-semibold text-white mb-4">Synthèse de l'expérience</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Ce premier stage m'a permis de découvrir le monde professionnel et de mettre en pratique 
                  mes connaissances théoriques. J'ai particulièrement apprécié [aspect positif du stage].
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Cette expérience m'a également permis de mieux cerner mes objectifs professionnels 
                  et de développer des compétences essentielles pour la suite de mon parcours.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-3">Apports personnels</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Développement de l'autonomie professionnelle</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Amélioration des capacités d'adaptation</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Renforcement des compétences relationnelles</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-5">
                  <h4 className="text-lg font-semibold text-cyan-400 mb-3">Perspectives d'évolution</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Approfondissement des connaissances métier</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Élargissement du réseau professionnel</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Orientation vers le prochain stage</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StageDeuxiemeAnnee = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/3889053/pexels-photo-3889053.jpeg)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            Stage <span className="text-cyan-400">2ème Année</span>
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Évolution professionnelle</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Fort de l'expérience acquise lors de mon premier stage, j'ai pu aborder ce second stage 
              avec plus de confiance et d'autonomie. Cette progression m'a permis de prendre des responsabilités 
              plus importantes et de contribuer de manière plus significative aux projets de l'entreprise.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Informations générales</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Entreprise</h3>
                <p className="text-gray-300">[Nom de l'entreprise]</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Période</h3>
                <p className="text-gray-300">[Date de début - Date de fin]</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Poste</h3>
                <p className="text-gray-300">[Intitulé du poste]</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Secteur</h3>
                <p className="text-gray-300">[Secteur d'activité]</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Projets principaux</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-400 pl-6">
                <h3 className="text-xl font-semibold text-white mb-2">Projet 1</h3>
                <p className="text-gray-300 mb-3">Description détaillée du projet principal réalisé pendant ce stage.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Outil 1</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Outil 2</span>
                </div>
              </div>
              
              <div className="border-l-4 border-cyan-400 pl-6">
                <h3 className="text-xl font-semibold text-white mb-2">Projet 2</h3>
                <p className="text-gray-300 mb-3">Autre projet significatif et son impact sur l'entreprise.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Technologie A</span>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">Technologie B</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Responsabilités et autonomie</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Nouvelles responsabilités</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Gestion de projet en autonomie</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Formation de nouveaux stagiaires</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Participation aux réunions stratégiques</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Compétences renforcées</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Leadership et management</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Prise de décision</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span className="text-gray-300">Vision stratégique</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Résultats et impact</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ce stage m'a permis de démontrer mes capacités d'adaptation et d'évolution. 
              J'ai pu apporter une réelle valeur ajoutée à l'équipe et contribuer aux objectifs de l'entreprise.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">X%</div>
                <div className="text-gray-300">Amélioration métrique 1</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">X</div>
                <div className="text-gray-300">Projets menés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">X</div>
                <div className="text-gray-300">Collaborateurs formés</div>
              </div>
            </div>
          </div>

          {/* Placeholder for Images */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Portfolio de projets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-700 border border-gray-600 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-gray-400">Projet {item}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4">
              *Vous pourrez ajouter vos captures d'écran et images de projets ici
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConclusionPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b)'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white">
            <span className="text-cyan-400">Conclusion</span> & Perspectives
          </h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Bilan de parcours</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Ces deux années de stages m'ont permis de construire une expérience professionnelle solide 
              et de développer une vision claire de mon avenir. L'évolution entre le premier et le second stage 
              démontre ma capacité d'adaptation et mon désir constant d'apprendre.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Chaque expérience a apporté sa propre valeur : découverte du monde professionnel, 
              montée en compétences, prise de responsabilités et développement de mon réseau professionnel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Compétences acquises</h3>
              <div className="space-y-3">
                {[
                  'Expertise technique approfondie',
                  'Capacité de leadership',
                  'Gestion de projet',
                  'Communication professionnelle',
                  'Adaptabilité et résilience'
                ].map((skill, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Valeurs développées</h3>
              <div className="space-y-3">
                {[
                  'Esprit d\'équipe',
                  'Sens des responsabilités',
                  'Innovation et créativité',
                  'Éthique professionnelle',
                  'Curiosité intellectuelle'
                ].map((value, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Perspectives d'avenir</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Objectifs à court terme</h3>
                <p className="text-gray-300 leading-relaxed">
                  Dans l'immédiat, je souhaite finaliser mes études en approfondissant les domaines 
                  qui m'ont le plus passionné durant ces stages. Je compte également maintenir et 
                  développer les relations professionnelles établies.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Vision à long terme</h3>
                <p className="text-gray-300 leading-relaxed">
                  Mon objectif est de devenir un professionnel reconnu dans [votre domaine], 
                  en combinant expertise technique et capacités managériales. Je vise un poste à responsabilités 
                  où je pourrai contribuer à l'innovation et au développement d'équipes performantes.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Remerciements</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Je tiens à exprimer ma gratitude envers toutes les personnes qui ont contribué à la réussite 
              de ces stages. Mes maîtres de stage, mes collègues, et l'ensemble des équipes rencontrées 
              ont enrichi mon parcours par leur expertise et leur bienveillance.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Ces expériences m'ont non seulement formé professionnellement, mais ont également 
              contribué à mon développement personnel. Je suis désormais prêt(e) à relever de nouveaux défis 
              et à apporter ma contribution au monde professionnel.
            </p>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-cyan-400 mb-4">
              Prêt(e) pour la prochaine étape
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Cette expérience m'a préparé(e) à intégrer le monde professionnel avec confiance et ambition.
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
};

// Admin Login Component
const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdmin();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await adminLogin(password);
    if (!success) {
      setError('Mot de passe incorrect');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Administration <span className="text-cyan-400">Portfolio</span>
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              placeholder="Entrez le mot de passe"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: '' });
  const { adminToken, adminLogout } = useAdmin();

  useEffect(() => {
    fetchAllContent();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: '' });
  };

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/content`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setContent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      showToast('Erreur lors du chargement du contenu', 'error');
      setLoading(false);
    }
  };

  const handleSave = async (section, data) => {
    setSaving(true);
    try {
      let endpoint = '';
      if (section === 'personal') {
        endpoint = '/api/admin/personal-info';
      } else if (section.startsWith('stage')) {
        endpoint = '/api/admin/stages';
      } else {
        endpoint = `/api/admin/content/${section}`;
      }

      await axios.post(`${API_URL}${endpoint}`, data, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      // Refresh content
      await fetchAllContent();
      showToast('✅ Sauvegardé avec succès !', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('❌ Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      showToast('📤 Upload en cours...', 'info');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/api/admin/upload-image`, formData, {
        headers: { 
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      showToast('✅ Image uploadée avec succès !', 'success');
      return response.data.data; // Return base64 data
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('❌ Erreur lors de l\'upload de l\'image', 'error');
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-cyan-400 text-xl">Chargement du contenu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            Administration <span className="text-cyan-400">Portfolio</span>
          </h1>
          <div className="flex space-x-4">
            <Link to="/" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Voir le site
            </Link>
            <button
              onClick={adminLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'personal' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                À propos de moi
              </button>
              <button
                onClick={() => setActiveTab('stage1')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'stage1' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Stage 1ère année
              </button>
              <button
                onClick={() => setActiveTab('stage2')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'stage2' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Stage 2ème année
              </button>
              <button
                onClick={() => setActiveTab('conclusion')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'conclusion' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Conclusion
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'personal' && (
            <PersonalInfoForm 
              data={content?.personal_info || {}} 
              onSave={(data) => handleSave('personal', data)} 
              onImageUpload={handleImageUpload}
              saving={saving}
            />
          )}
          
          {activeTab === 'stage1' && (
            <StageForm 
              data={content?.stages?.find(s => s.stage_type === 'stage1') || {}} 
              stageType="stage1"
              title="Stage 1ère année"
              onSave={(data) => handleSave('stages', data)} 
              onImageUpload={handleImageUpload}
              saving={saving}
            />
          )}
          
          {activeTab === 'stage2' && (
            <StageForm 
              data={content?.stages?.find(s => s.stage_type === 'stage2') || {}} 
              stageType="stage2"
              title="Stage 2ème année"
              onSave={(data) => handleSave('stages', data)} 
              onImageUpload={handleImageUpload}
              saving={saving}
            />
          )}
          
          {activeTab === 'conclusion' && (
            <ConclusionForm 
              data={content?.sections?.find(s => s.section_id === 'conclusion') || {}} 
              onSave={(data) => handleSave('conclusion', data)}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// PersonalInfoForm Component
const PersonalInfoForm = ({ data, onSave, onImageUpload, saving }) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    linkedin: data.linkedin || '',
    description: data.description || '',
    skills: data.skills || [],
    profile_image: data.profile_image || ''
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData({
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedin: data.linkedin || '',
      description: data.description || '',
      skills: data.skills || [],
      profile_image: data.profile_image || ''
    });
    setHasChanges(false);
  }, [data]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
    setHasChanges(true);
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
    setHasChanges(true);
  };

  const removeSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
    setHasChanges(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageData = await onImageUpload(file);
      if (imageData) {
        handleChange('profile_image', imageData);
      }
    }
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Informations personnelles</h2>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
            <input
              type="text"
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Photo de profil</label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
            {formData.profile_image && (
              <img src={formData.profile_image} alt="Profile" className="w-16 h-16 object-cover rounded-full" />
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Compétences</label>
          <div className="space-y-2">
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => removeSkill(index)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors"
            >
              Ajouter une compétence
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
};

// StageForm Component
const StageForm = ({ data, stageType, title, onSave, onImageUpload, saving }) => {
  const [formData, setFormData] = useState({
    stage_type: stageType,
    company: data.company || '',
    position: data.position || '',
    period: data.period || '',
    sector: data.sector || '',
    description: data.description || '',
    missions: data.missions || [
      { title: '', description: '', skills: [], images: [] },
      { title: '', description: '', points: [], images: [] },
      { title: '', description: '', results: { improvement: '', projects: '' }, images: [] },
      { title: '', description: '', achievements: [], images: [] }
    ],
    skills: data.skills || [],
    achievements: data.achievements || [],
    images: data.images || []
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  // Update form data when props change (after saving)
  useEffect(() => {
    setFormData({
      stage_type: stageType,
      company: data.company || '',
      position: data.position || '',
      period: data.period || '',
      sector: data.sector || '',
      description: data.description || '',
      missions: data.missions || [
        { title: '', description: '', skills: [], images: [] },
        { title: '', description: '', points: [], images: [] },
        { title: '', description: '', results: { improvement: '', projects: '' }, images: [] },
        { title: '', description: '', achievements: [], images: [] }
      ],
      skills: data.skills || [],
      achievements: data.achievements || [],
      images: data.images || []
    });
    setHasChanges(false);
  }, [data, stageType]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleMissionChange = (missionIndex, field, value) => {
    const newMissions = [...formData.missions];
    newMissions[missionIndex] = { ...newMissions[missionIndex], [field]: value };
    setFormData(prev => ({ ...prev, missions: newMissions }));
    setHasChanges(true);
  };

  const handleImageUpload = async (e, type, index = null) => {
    const file = e.target.files[0];
    if (file) {
      const imageData = await onImageUpload(file);
      if (imageData) {
        if (type === 'company') {
          const newImages = [...formData.images];
          newImages[index] = imageData;
          handleChange('images', newImages);
        } else if (type === 'mission') {
          const newMissions = [...formData.missions];
          const newMissionImages = [...(newMissions[index].images || [])];
          newMissionImages.push(imageData);
          newMissions[index].images = newMissionImages;
          setFormData(prev => ({ ...prev, missions: newMissions }));
          setHasChanges(true);
        }
      }
    }
  };
  
  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
      
      {/* Informations générales */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Informations générales</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Entreprise</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Poste</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Période</label>
            <input
              type="text"
              value={formData.period}
              onChange={(e) => handleChange('period', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
            <input
              type="text"
              value={formData.sector}
              onChange={(e) => handleChange('sector', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description de l'entreprise</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Photos de l'entreprise</label>
          <div className="grid grid-cols-1 gap-4">
            {/* Identité visuelle */}
            <div className="border border-gray-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-3">Identité visuelle</h4>
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {['Logo de l\'entreprise', 'Façade/Bâtiment'].map((label, index) => (
                  <div key={index}>
                    <label className="block text-xs text-gray-400 mb-1">{label}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'company', index)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                    />
                    {formData.images[index] && (
                      <ClickableImage
                        src={formData.images[index]}
                        alt={label}
                        className="w-full h-24 object-cover rounded mt-1 border border-gray-600"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Découvertes & Environnement */}
            <div className="border border-gray-600 rounded-lg p-4">
              <h4 className="text-cyan-400 font-semibold mb-3">Découvertes & Environnement</h4>
              
              {/* Plans & Organisation */}
              <div className="mb-4">
                <h5 className="text-white text-sm mb-2">Plans & Organisation</h5>
                <div className="grid grid-cols-2 gap-2">
                  {['Plans des locaux', 'Organigramme'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'company', index + 14)}
                        className="w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                      />
                      {formData.images[index + 14] && (
                        <ClickableImage
                          src={formData.images[index + 14]}
                          alt={label}
                          className="w-full h-16 object-cover rounded mt-1 border border-gray-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bureaux & Espaces */}
              <div className="mb-4">
                <h5 className="text-white text-sm mb-2">Bureaux & Espaces</h5>
                <div className="grid grid-cols-2 gap-2">
                  {['Mon poste de travail', 'Salles de réunion'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'company', index + 2)}
                        className="w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                      />
                      {formData.images[index + 2] && (
                        <ClickableImage
                          src={formData.images[index + 2]}
                          alt={label}
                          className="w-full h-16 object-cover rounded mt-1 border border-gray-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Équipement informatique */}
              <div className="mb-4">
                <h5 className="text-white text-sm mb-2">Équipement informatique</h5>
                <div className="grid grid-cols-2 gap-2">
                  {['Poste de travail', 'Équipements techniques'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'company', index + 4)}
                        className="w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                      />
                      {formData.images[index + 4] && (
                        <ClickableImage
                          src={formData.images[index + 4]}
                          alt={label}
                          className="w-full h-16 object-cover rounded mt-1 border border-gray-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Personnel de l'entreprise */}
              <div className="mb-4">
                <h5 className="text-white text-sm mb-2">Personnel de l'entreprise</h5>
                <div className="grid grid-cols-2 gap-2">
                  {['Équipe/Collègues', 'Encadrants/Managers'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'company', index + 6)}
                        className="w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                      />
                      {formData.images[index + 6] && (
                        <ClickableImage
                          src={formData.images[index + 6]}
                          alt={label}
                          className="w-full h-16 object-cover rounded mt-1 border border-gray-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications & Technologies */}
              <div>
                <h5 className="text-white text-sm mb-2">Applications & Technologies</h5>
                <div className="grid grid-cols-3 gap-2">
                  {['Application 1', 'Application 2', 'Plateforme A', 'Plateforme B', 'Outil métier', 'Technologie'].map((label, index) => (
                    <div key={index}>
                      <label className="block text-xs text-gray-400 mb-1">{label}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'company', index + 8)}
                        className="w-full px-1 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs file:mr-1 file:py-1 file:px-1 file:rounded file:border-0 file:text-xs file:bg-cyan-600 file:text-white hover:file:bg-cyan-500"
                      />
                      {formData.images[index + 8] && (
                        <ClickableImage
                          src={formData.images[index + 8]}
                          alt={label}
                          className="w-full h-12 object-cover rounded mt-1 border border-gray-600"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Missions */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">Missions</h3>
        {formData.missions.map((mission, index) => (
          <div key={index} className="bg-gray-900/50 border border-gray-600 rounded-xl p-4 space-y-4">
            <h4 className="text-lg font-semibold text-white">Mission {index + 1}</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
              <input
                type="text"
                value={mission.title}
                onChange={(e) => handleMissionChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={mission.description}
                onChange={(e) => handleMissionChange(index, 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            
            {/* Champs spécifiques selon le type de mission */}
            {index === 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Compétences mobilisées (séparées par des virgules)</label>
                <input
                  type="text"
                  value={mission.skills ? mission.skills.join(', ') : ''}
                  onChange={(e) => handleMissionChange(index, 'skills', e.target.value.split(', ').filter(s => s.trim()))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Compétence 1, Compétence 2, Compétence 3"
                />
              </div>
            )}
            
            {index === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Points clés (séparés par des virgules)</label>
                <input
                  type="text"
                  value={mission.points ? mission.points.join(', ') : ''}
                  onChange={(e) => handleMissionChange(index, 'points', e.target.value.split(', ').filter(s => s.trim()))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Point 1, Point 2, Point 3"
                />
              </div>
            )}
            
            {index === 2 && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amélioration (%)</label>
                    <input
                      type="text"
                      value={mission.results?.improvement || ''}
                      onChange={(e) => handleMissionChange(index, 'results', { ...mission.results, improvement: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="25%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de projets</label>
                    <input
                      type="text"
                      value={mission.results?.projects || ''}
                      onChange={(e) => handleMissionChange(index, 'results', { ...mission.results, projects: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {index === 3 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Réalisations principales (séparées par des virgules)</label>
                <input
                  type="text"
                  value={mission.achievements ? mission.achievements.join(', ') : ''}
                  onChange={(e) => handleMissionChange(index, 'achievements', e.target.value.split(', ').filter(s => s.trim()))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  placeholder="Réalisation 1, Réalisation 2, Réalisation 3"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photos de la mission</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, 'mission', index)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              {mission.images && mission.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {mission.images.map((img, imgIndex) => (
                    <img key={imgIndex} src={img} alt={`Mission ${index + 1} - ${imgIndex + 1}`} className="w-20 h-20 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
};

// Conclusion Form Component
const ConclusionForm = ({ data, onSave, saving }) => {
  const [formData, setFormData] = useState({
    section_id: 'conclusion',
    title: data.title || 'Conclusion & Perspectives',
    content: data.content || ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">Conclusion</h2>
      
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contenu</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={10}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            placeholder="Écrivez votre conclusion ici..."
          />
        </div>
      </div>
      
      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50"
      >
        {saving ? 'Sauvegarde...' : 'Sauvegarder'}
      </button>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/stage-premiere-annee" element={<StagePremiereAnnee />} />
          <Route path="/stage-deuxieme-annee" element={<StageDeuxiemeAnnee />} />
          <Route path="/conclusion" element={<ConclusionPage />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

// Admin Route with Authentication
const AdminRoute = () => {
  const { isAdminAuthenticated } = useAdmin();
  
  return isAdminAuthenticated ? <AdminDashboard /> : <AdminLogin />;
};

export default App;