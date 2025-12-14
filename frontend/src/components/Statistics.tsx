import React, { useState, useEffect, useMemo } from 'react';
import { trainingsApi, participantsApi } from '../utils/api';
import { ArrowLeft, TrendingUp, Users, Award, Calendar, BarChart } from 'lucide-react';

// --- INTERFACES POUR TYPAGE ---

interface Training {
  id: string;
  title: string;
}

interface Participant {
  id: string;
  participantName: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string; // ISO date string
  approvalDate?: string; // ISO date string (Crucial for monthly stats)
  trainingTitle?: string; // Used instead of trainingId
}

interface StatisticsData {
  totalCertified: number;
  pendingRequests: number;
  totalTrainings: number;
  totalParticipants: number;
  approvalRate: number;
  certifiedByTraining: Record<string, number>;
  monthlyStats: Record<string, number>;
}

// --- UTILITY COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'yellow' | 'green' | 'purple';
  subtitle: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition-shadow hover:shadow-xl">
      <div className="flex items-start">
        <div className={`p-3 ${colorClasses.bg} rounded-full flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colorClasses.text}`} />
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-sm font-medium text-gray-600 uppercase truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

interface StatisticsProps {
  onBack: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({ onBack }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const [userId, setUserId] = useState<string | null>('admin');
  const [isLoading, setIsLoading] = useState(true);

  // 1. DATA LOADING FROM BACKEND
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [trainingsData, participantsData] = await Promise.all([
          trainingsApi.getAll(),
          participantsApi.getAll()
        ]);
        setTrainings(trainingsData);
        setParticipants(participantsData);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 3. STATISTICAL CALCULATION (Keep the user's logic)
  const stats: StatisticsData = useMemo(() => {
    if (participants.length === 0) {
      return {
        totalCertified: 0,
        pendingRequests: 0,
        totalTrainings: trainings.length,
        totalParticipants: 0,
        approvalRate: 0,
        certifiedByTraining: {},
        monthlyStats: {}
      };
    }

    const totalCertified = participants.filter(p => p.status === 'approved').length;
    const pendingRequests = participants.filter(p => p.status === 'pending').length;
    const totalTrainings = trainings.length;
    const totalParticipants = participants.length;
    const approvalRate = totalParticipants > 0 ? (totalCertified / totalParticipants) * 100 : 0;

    // Statistiques par formation
    const certifiedByTraining: Record<string, number> = {};
    participants
      .filter(p => p.status === 'approved')
      .forEach(p => {
        const trainingName = p.trainingTitle || 'Formation inconnue';
        certifiedByTraining[trainingName] = (certifiedByTraining[trainingName] || 0) + 1;
      });

    // Statistiques mensuelles (par date d'approbation)
    const monthlyStats: Record<string, number> = {};
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    participants
      .filter(p => p.status === 'approved' && p.approvalDate)
      .forEach(p => {
        try {
            const date = new Date(p.approvalDate!);
            const year = date.getFullYear();
            const monthKey = `${months[date.getMonth()]} ${year}`;

            // Format YYYY-MM pour le tri (important pour les graphiques)
            const sortKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            monthlyStats[sortKey] = (monthlyStats[sortKey] || 0) + 1;
        } catch (e) {
            console.warn("Invalid approval date:", p.approvalDate, e);
        }
      });

    // Reformatage pour l'affichage (tri par clé YYYY-MM)
    const sortedMonthlyStats: Record<string, number> = {};
    Object.keys(monthlyStats).sort().forEach(sortKey => {
        const [year, monthIndex] = sortKey.split('-').map(Number);
        const monthKey = `${months[monthIndex - 1]} ${year}`;
        sortedMonthlyStats[monthKey] = monthlyStats[sortKey];
    });


    return {
      totalCertified,
      pendingRequests,
      totalTrainings,
      totalParticipants,
      approvalRate,
      certifiedByTraining,
      monthlyStats: sortedMonthlyStats
    };
  }, [participants, trainings]);

  // UI Helpers for Chart Data
  const monthlyChartData = useMemo(() => {
    return Object.entries(stats.monthlyStats).map(([month, count]) => ({ month, count }));
  }, [stats.monthlyStats]);

  const maxMonthlyCount = useMemo(() => {
    return monthlyChartData.length > 0 ? Math.max(...monthlyChartData.map(d => d.count)) : 0;
  }, [monthlyChartData]);

  const ChartBar: React.FC<{ month: string, count: number, maxCount: number }> = ({ month, count, maxCount }) => {
    const heightPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
      <div className="flex flex-col items-center w-full h-full justify-end" title={`${month}: ${count} certifié(s)`}>
        <div className="text-xs text-gray-600 mb-1 font-medium">{count}</div>
        <div
          className="w-4 sm:w-6 rounded-t-lg bg-gradient-to-t from-blue-400 to-indigo-600 transition-all duration-700 ease-out shadow-md"
          style={{ height: `${heightPercentage}%` }}
        ></div>
        <div className="text-xs text-gray-500 mt-2 rotate-45 transform origin-top-left whitespace-nowrap">{month.substring(0, 3)}</div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-indigo-600 font-semibold">Chargement des statistiques depuis le backend...</p>
          <p className="text-xs text-gray-400 mt-2">Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center text-gray-500 hover:text-indigo-600 mr-4 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Tableau de Bord des Certifications</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User ID (MANDATORY) */}
        <div className="text-xs text-gray-500 mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          ID Utilisateur: <span className="font-mono text-gray-700 break-all">{userId}</span>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Certifiés"
            value={stats.totalCertified}
            icon={Award}
            color="blue"
            subtitle={`${stats.totalParticipants} participants au total`}
          />

          <StatCard
            title="Demandes En Attente"
            value={stats.pendingRequests}
            icon={Users}
            color="yellow"
            subtitle={`${stats.totalParticipants - stats.totalCertified} non-approuvé(s)`}
          />

          <StatCard
            title="Formations Actives"
            value={stats.totalTrainings}
            icon={Calendar}
            color="green"
            subtitle={`Modèles disponibles`}
          />

          <StatCard
            title="Taux d'Approbation"
            value={`${stats.approvalRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="purple"
            subtitle={`Sur ${stats.totalParticipants} participants`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Monthly Evolution CHART */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-indigo-600" /> Évolution Mensuelle des Certifications
            </h2>
            <div className="h-72 w-full overflow-x-auto">
              <div className={`flex justify-start items-end h-full py-4 ${monthlyChartData.length > 5 ? 'w-full md:w-auto min-w-[500px]' : 'w-full'}`}>
                {monthlyChartData.length === 0 ? (
                  <div className="w-full text-center py-10 text-gray-400">
                    <p>Aucune donnée d'approbation pour les graphiques.</p>
                  </div>
                ) : (
                  monthlyChartData.map((data, index) => (
                    <ChartBar
                      key={data.month}
                      month={data.month}
                      count={data.count}
                      maxCount={maxMonthlyCount}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Certifications by Training LIST */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Certifiés par Formation</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.keys(stats.certifiedByTraining).length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                    <p>Aucun certificat approuvé.</p>
                </div>
              ) : (
                Object.entries(stats.certifiedByTraining).map(([trainingName, count]) => {
                  const percentage = stats.totalCertified > 0 ? (count / stats.totalCertified) * 100 : 0;
                  return (
                    <div key={trainingName}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 truncate" title={trainingName}>
                          {trainingName}
                        </span>
                        <span className="text-sm text-gray-500 font-semibold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-blue-500 mt-1">{percentage.toFixed(1)}% du total</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Additional Custom Metrics (Static, as they require complex calculation or external data not present in Firestore) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métrique Avancée</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
              <p className="text-sm text-gray-500">Non calculé sans données spécifiques</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps Moyen de Traitement</h3>
            <div className="text-center">
              {/* Le calcul du délai moyen nécessite les dates de demande et d'approbation pour chaque participant.
              Pour l'instant, c'est une donnée non calculée. */}
              <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
              <p className="text-sm text-gray-500">Demande/Approbation</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Taux de Rejet</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {(100 - stats.approvalRate).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Basé sur le total des demandes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;