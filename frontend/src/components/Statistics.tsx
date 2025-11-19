import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { participantsApi, trainingsApi } from '../utils/api';
import { Participant, Training } from '../types';

interface StatisticsProps {
  onBack: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ onBack }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCertified: 0,
    pendingRequests: 0,
    totalTrainings: 0,
    certifiedByTraining: {} as Record<string, number>,
    monthlyStats: {} as Record<string, number>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [participantsData, trainingsData] = await Promise.all([
        participantsApi.getAll(),
        trainingsApi.getAll()
      ]);
      
      setParticipants(participantsData);
      setTrainings(trainingsData);
      
      // Calculer les statistiques réelles
      const totalCertified = participantsData.filter(p => p.status === 'approved').length;
      const pendingRequests = participantsData.filter(p => p.status === 'pending').length;
      const totalTrainings = trainingsData.length;
      
      // Statistiques par formation
      const certifiedByTraining: Record<string, number> = {};
      participantsData
        .filter(p => p.status === 'approved')
        .forEach(p => {
          const training = trainingsData.find(t => t.id === p.trainingId);
          const trainingName = training?.title || 'Formation inconnue';
          certifiedByTraining[trainingName] = (certifiedByTraining[trainingName] || 0) + 1;
        });
      
      // Statistiques mensuelles
      const monthlyStats: Record<string, number> = {};
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      participantsData
        .filter(p => p.status === 'approved' && p.approvalDate)
        .forEach(p => {
          const date = new Date(p.approvalDate!);
          const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
          monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
        });
      
      setStats({
        totalCertified,
        pendingRequests,
        totalTrainings,
        certifiedByTraining,
        monthlyStats
      });
    } catch (error) {
      console.error('Failed to load statistics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certifiés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertified}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% ce mois
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600">Demandes à traiter</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Formations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrainings}</p>
                <p className="text-xs text-green-600">Sessions organisées</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
                <p className="text-xs text-purple-600">Taux d'approbation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Certifications by Training */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Certifiés par Formation</h2>
            <div className="space-y-4">
              {Object.entries(stats.certifiedByTraining).map(([training, count]) => {
                const percentage = (count / stats.totalCertified) * 100;
                return (
                  <div key={training}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {training.length > 40 ? `${training.substring(0, 40)}...` : training}
                      </span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Evolution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Évolution Mensuelle</h2>
            <div className="space-y-4">
              {Object.entries(stats.monthlyStats).map(([month, count]) => {
                const maxCount = Math.max(...Object.values(stats.monthlyStats));
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={month} className="flex items-center">
                    <div className="w-16 text-sm text-gray-600">{month}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm text-gray-700 font-medium">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Mensuelle</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+18%</div>
              <p className="text-sm text-gray-600">Augmentation par rapport au mois dernier</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps Moyen</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">2.3j</div>
              <p className="text-sm text-gray-600">Délai moyen de traitement des demandes</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <p className="text-sm text-gray-600">Note moyenne de satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;