import React from 'react';
import { Hash, User, Calendar, MapPin, Clock, Award, FileText, Building, Mail } from 'lucide-react';

interface Variable {
  id: string;
  name: string;
  placeholder: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
}

interface DynamicVariablesPanelProps {
  onVariableSelect?: (variable: Variable) => void;
  onVariableDrag?: (variable: Variable, e: React.DragEvent) => void;
}

const DynamicVariablesPanel: React.FC<DynamicVariablesPanelProps> = ({
  onVariableSelect,
  onVariableDrag
}) => {
  const variables: Variable[] = [
    // Participant Information
    {
      id: 'participantName',
      name: 'Nom du participant',
      placeholder: '{{participantName}}',
      icon: User,
      description: 'Nom complet du participant',
      category: 'Participant'
    },
    {
      id: 'certificateNumber',
      name: 'Numéro de certificat',
      placeholder: '{{certificateNumber}}',
      icon: Hash,
      description: 'Numéro unique du certificat',
      category: 'Certificat'
    },

    // Training Information
    {
      id: 'trainingTitle',
      name: 'Titre de formation',
      placeholder: '{{trainingTitle}}',
      icon: Award,
      description: 'Titre de la formation',
      category: 'Formation'
    },
    {
      id: 'trainingDate',
      name: 'Date de formation',
      placeholder: '{{trainingDate}}',
      icon: Calendar,
      description: 'Date de la formation',
      category: 'Formation'
    },
    {
      id: 'trainingLocation',
      name: 'Lieu de formation',
      placeholder: '{{trainingLocation}}',
      icon: MapPin,
      description: 'Lieu où se déroule la formation',
      category: 'Formation'
    },
    {
      id: 'trainingDuration',
      name: 'Durée de formation',
      placeholder: '{{trainingDuration}}',
      icon: Clock,
      description: 'Durée totale de la formation',
      category: 'Formation'
    },

    // Instructor & Organization
    {
      id: 'instructor',
      name: 'Formateur',
      placeholder: '{{instructor}}',
      icon: User,
      description: 'Nom du formateur/instructeur',
      category: 'Formateur'
    },
    {
      id: 'organization',
      name: 'Organisation',
      placeholder: '{{organization}}',
      icon: Building,
      description: 'Nom de l\'organisation',
      category: 'Organisation'
    },

    // Certificate Details
    {
      id: 'issueDate',
      name: 'Date d\'émission',
      placeholder: '{{issueDate}}',
      icon: Calendar,
      description: 'Date d\'émission du certificat',
      category: 'Certificat'
    },
    {
      id: 'projectInfo',
      name: 'Informations projet',
      placeholder: '{{projectInfo}}',
      icon: FileText,
      description: 'Informations sur le projet',
      category: 'Projet'
    }
  ];

  const categories = [...new Set(variables.map(v => v.category))];

  const handleDragStart = (variable: Variable, e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(variable));
    e.dataTransfer.effectAllowed = 'copy';
    onVariableDrag?.(variable, e);
  };

  const handleClick = (variable: Variable) => {
    onVariableSelect?.(variable);
  };

  return (
    <div className="w-64 bg-[#2D2D2D] border-r border-gray-600 overflow-y-auto" style={{ height: 'calc(100vh - 28px)' }}>
      <div className="p-3 border-b border-gray-600">
        <h3 className="text-white text-sm font-semibold mb-1">Variables Dynamiques</h3>
        <p className="text-gray-400 text-xs">Glissez-déposez les variables sur le canevas</p>
      </div>

      <div className="p-2">
        {categories.map(category => (
          <div key={category} className="mb-4">
            <h4 className="text-gray-300 text-xs font-medium mb-2 uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-1">
              {variables
                .filter(v => v.category === category)
                .map(variable => {
                  const IconComponent = variable.icon;
                  return (
                    <div
                      key={variable.id}
                      draggable
                      onDragStart={(e) => handleDragStart(variable, e)}
                      onClick={() => handleClick(variable)}
                      className="flex items-center p-2 bg-[#3A3A3A] hover:bg-[#4A4A4A] rounded cursor-pointer transition-colors group"
                      title={`${variable.description} - ${variable.placeholder}`}
                    >
                      <IconComponent className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-xs font-medium truncate">
                          {variable.name}
                        </div>
                        <div className="text-gray-400 text-xs truncate">
                          {variable.placeholder}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-600 mt-4">
        <div className="text-gray-400 text-xs">
          <p className="mb-1"><strong>Conseil :</strong></p>
          <p>Les variables seront automatiquement remplacées par les vraies valeurs lors de la génération du certificat.</p>
        </div>
      </div>
    </div>
  );
};

export default DynamicVariablesPanel;