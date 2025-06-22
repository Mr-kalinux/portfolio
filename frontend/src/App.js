import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-8">
            À <span className="text-cyan-400">propos</span> de moi
          </h1>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div 
                className="rounded-xl bg-cover bg-center h-96 border border-gray-700"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1555212697-194d092e3b8f)'
                }}
              ></div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Profil</h3>
                <p className="text-gray-300 leading-relaxed">
                  Étudiant(e) motivé(e) et passionné(e), je poursuis actuellement mes études en [Votre Domaine d'Études]. 
                  À travers mes stages, j'ai développé des compétences solides et une vision claire de mon avenir professionnel.
                </p>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {['Compétence 1', 'Compétence 2', 'Compétence 3', 'Compétence 4', 'Compétence 5'].map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-4">Contact</h3>
                <div className="space-y-2 text-gray-300">
                  <p>📧 votre.email@exemple.com</p>
                  <p>📱 +33 X XX XX XX XX</p>
                  <p>🌐 LinkedIn: /votre-profil</p>
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
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Informations générales</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Informations textuelles */}
              <div className="md:col-span-2 space-y-6">
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
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Description de l'entreprise</h3>
                  <p className="text-gray-300 leading-relaxed">
                    [Ajoutez ici une description de l'entreprise, son secteur d'activité, 
                    sa taille, ses valeurs, et le contexte dans lequel vous avez évolué 
                    pendant votre stage.]
                  </p>
                </div>
              </div>
              
              {/* Section Photos de l'entreprise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Photos de l'entreprise</h3>
                <div className="space-y-3">
                  <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                    <span className="text-gray-400 text-sm text-center">Logo/Façade<br/>entreprise</span>
                  </div>
                  <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                    <span className="text-gray-400 text-sm text-center">Espace de<br/>travail</span>
                  </div>
                  <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                    <span className="text-gray-400 text-sm text-center">Équipe/<br/>Collègues</span>
                  </div>
                  <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-24 flex items-center justify-center hover:border-cyan-400 transition-colors">
                    <span className="text-gray-400 text-sm text-center">Bureaux/<br/>Environnement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-8">Missions réalisées</h2>
            
            {/* Mission 1 */}
            <div className="mb-12 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-white">Mission 1 - [Titre de votre mission]</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    [Décrivez ici votre première mission principale. Expliquez le contexte, 
                    vos responsabilités, les défis rencontrés et les résultats obtenus. 
                    Cette section peut contenir plusieurs paragraphes pour détailler votre expérience.]
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-cyan-400">Compétences développées :</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">Compétence 1</span>
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">Compétence 2</span>
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">Compétence 3</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Photos de la mission :</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 1<br/>Mission 1</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 2<br/>Mission 1</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors col-span-2">
                      <span className="text-gray-400 text-sm text-center">Photo 3<br/>Mission 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission 2 */}
            <div className="mb-12 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-white">Mission 2 - [Titre de votre mission]</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    [Décrivez ici votre deuxième mission principale. Mettez l'accent sur 
                    l'évolution par rapport à la première mission, les nouvelles responsabilités 
                    et les apprentissages spécifiques à cette mission.]
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-cyan-400">Points clés :</h4>
                    <ul className="space-y-1">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                        <span className="text-gray-300 text-sm">Point important 1</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                        <span className="text-gray-300 text-sm">Point important 2</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"></div>
                        <span className="text-gray-300 text-sm">Point important 3</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Documentation visuelle :</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 1<br/>Mission 2</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 2<br/>Mission 2</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors col-span-2">
                      <span className="text-gray-400 text-sm text-center">Photo 3<br/>Mission 2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission 3 */}
            <div className="mb-8 bg-gray-900/50 border border-gray-600 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                <h3 className="text-2xl font-bold text-white">Mission 3 - [Titre de votre mission]</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">
                    [Présentez votre troisième mission principale. Soulignez l'impact 
                    de cette mission sur votre développement professionnel et les résultats 
                    concrets que vous avez obtenus.]
                  </p>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-cyan-400">Résultats obtenus :</h4>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">XX%</div>
                          <div className="text-gray-400 text-sm">Amélioration</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-cyan-400">XX</div>
                          <div className="text-gray-400 text-sm">Projets</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Galerie de réalisations :</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 1<br/>Mission 3</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors">
                      <span className="text-gray-400 text-sm text-center">Photo 2<br/>Mission 3</span>
                    </div>
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg h-32 flex items-center justify-center hover:border-cyan-400 transition-colors col-span-2">
                      <span className="text-gray-400 text-sm text-center">Photo 3<br/>Mission 3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Compétences développées</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Compétences techniques</h3>
                <div className="space-y-2">
                  {['Compétence technique 1', 'Compétence technique 2', 'Compétence technique 3'].map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Compétences transversales</h3>
                <div className="space-y-2">
                  {['Communication', 'Travail en équipe', 'Adaptabilité'].map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Bilan du stage</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ce premier stage m'a permis de découvrir le monde professionnel et de mettre en pratique 
              mes connaissances théoriques. J'ai particulièrement apprécié [aspect positif du stage].
            </p>
            <p className="text-gray-300 leading-relaxed">
              Cette expérience m'a également permis de mieux cerner mes objectifs professionnels 
              et de développer des compétences essentielles pour la suite de mon parcours.
            </p>
          </div>

          {/* Placeholder for Images */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">Galerie</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-gray-700 border border-gray-600 rounded-lg h-48 flex items-center justify-center">
                  <span className="text-gray-400">Image {item}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4">
              *Vous pourrez ajouter vos propres images ici
            </p>
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

// Navigation Component
const Navigation = () => {
  const location = useLocation();
  
  if (location.pathname === '/') {
    return null; // Don't show navigation on home page
  }
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-2xl font-bold text-white hover:text-cyan-400 transition-colors">
            Portfolio
          </Link>
          
          <div className="flex space-x-6">
            <Link 
              to="/about" 
              className={`hover:text-cyan-400 transition-colors ${
                location.pathname === '/about' ? 'text-cyan-400' : 'text-gray-300'
              }`}
            >
              À propos
            </Link>
            <Link 
              to="/stage-premiere-annee" 
              className={`hover:text-cyan-400 transition-colors ${
                location.pathname === '/stage-premiere-annee' ? 'text-cyan-400' : 'text-gray-300'
              }`}
            >
              Stage 1ère
            </Link>
            <Link 
              to="/stage-deuxieme-annee" 
              className={`hover:text-cyan-400 transition-colors ${
                location.pathname === '/stage-deuxieme-annee' ? 'text-cyan-400' : 'text-gray-300'
              }`}
            >
              Stage 2ème
            </Link>
            <Link 
              to="/conclusion" 
              className={`hover:text-cyan-400 transition-colors ${
                location.pathname === '/conclusion' ? 'text-cyan-400' : 'text-gray-300'
              }`}
            >
              Conclusion
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/stage-premiere-annee" element={<StagePremiereAnnee />} />
          <Route path="/stage-deuxieme-annee" element={<StageDeuxiemeAnnee />} />
          <Route path="/conclusion" element={<ConclusionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;