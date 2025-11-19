import React, { useState } from 'react';
import { User, Send } from 'lucide-react';
import { participantsApi } from '../utils/api';

interface ParticipantFormProps {
  onSubmit?: (data: {
    participantName: string;
    email: string;
  }) => void;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    participantName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.participantName.trim() || !formData.email.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create participant request with pending status
      await participantsApi.create({
        participantName: formData.participantName,
        email: formData.email
      });

      setIsSubmitted(true);

      if (onSubmit) {
        onSubmit(formData);
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          participantName: '',
          email: ''
        });
      }, 3000);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi de votre demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande soumise avec succès !</h2>
          <p className="text-gray-600 leading-relaxed">
            Votre demande d'attestation a été enregistrée et sera examinée par notre équipe.
            Vous recevrez un email de confirmation et serez informé de l'approbation de votre demande.
          </p>
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>✅ Ce qui a été fait :</strong><br />
              1. Enregistrement de votre demande d'attestation<br />
              2. Envoi d'un email de confirmation<br />
              3. Votre demande sera examinée par l'administrateur
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Demande d'Attestation</h1>
          <p className="text-blue-100">Remplissez le formulaire pour soumettre votre demande d'attestation</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations personnelles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Entrez votre nom complet"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="votre.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">ℹ️ Comment ça fonctionne</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Votre demande sera examinée par l'administrateur</li>
              <li>• L'administrateur complétera les informations de formation et choisira un template</li>
              <li>• Un numéro de certificat unique sera généré</li>
              <li>• Votre attestation sera générée en PDF et envoyée par email</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Envoi en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Send className="w-5 h-5 mr-2" />
                Soumettre ma demande
              </div>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              En soumettant ce formulaire, vous acceptez que vos données soient traitées
              pour l'examen et l'approbation de votre demande d'attestation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ParticipantForm;