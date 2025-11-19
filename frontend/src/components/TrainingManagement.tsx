import React, { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, Clock, User } from 'lucide-react';
import { mockTrainings } from '../utils/mockData';
import { Training } from '../types';

interface TrainingManagementProps {
  onBack: () => void;
}

const TrainingManagement: React.FC<TrainingManagementProps> = ({ onBack }) => {
  const [trainings, setTrainings] = useState<Training[]>(mockTrainings);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    duration: '',
    instructor: ''
  });

  const handleAddTraining = () => {
    const newTraining: Training = {
      id: Date.now().toString(),
      ...formData
    };
    setTrainings([...trainings, newTraining]);
    setFormData({ title: '', date: '', location: '', duration: '', instructor: '' });
    setIsAdding(false);
  };

  const handleEditTraining = (training: Training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title,
      date: training.date,
      location: training.location,
      duration: training.duration,
      instructor: training.instructor
    });
  };

  const handleUpdateTraining = () => {
    if (editingTraining) {
      setTrainings(trainings.map(t => 
        t.id === editingTraining.id 
          ? { ...editingTraining, ...formData }
          : t
      ));
      setEditingTraining(null);
      setFormData({ title: '', date: '', location: '', duration: '', instructor: '' });
    }
  };

  const handleDeleteTraining = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      setTrainings(trainings.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ title: '', date: '', location: '', duration: '', instructor: '' });
    setIsAdding(false);
    setEditingTraining(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Formations</h1>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Formation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {(isAdding || editingTraining) ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingTraining ? 'Modifier la Formation' : 'Nouvelle Formation'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la formation *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Planification Opérationnelle avec MS Project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de la formation *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ouagadougou"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 30 heures"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formateur *
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Aimé SAWADO"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={editingTraining ? handleUpdateTraining : handleAddTraining}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTraining ? 'Mettre à jour' : 'Créer'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div key={training.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {training.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditTraining(training)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTraining(training.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3" />
                    <span>{new Date(training.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3" />
                    <span>{training.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-3" />
                    <span>{training.duration}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-3" />
                    <span>{training.instructor}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Formation active
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {trainings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune formation</h3>
            <p className="text-gray-500 mb-4">Commencez par créer votre première formation</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer une formation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingManagement;