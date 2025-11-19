import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Je suis votre assistant BIMADES. Comment puis-je vous aider avec la gestion des attestations ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const RASA_API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyNzY1Y2M3Yi1mYTRlLTRhYjItYTkxNC05MmQ4ODM3ZGFiNjciLCJpYXQiOjE3NTYyMDQ1MTksIm5iZiI6MTc1NjIwNDUxNSwic2NvcGUiOiJyYXNhOnBybyByYXNhOnBybzpjaGFtcGlvbiByYXNhOnZvaWNlIiwiZXhwIjoxODUwODk4OTE1LCJlbWFpbCI6Im9kZ3lhbm5ib3JpczExMDVAZ21haWwuY29tIiwiY29tcGFueSI6IlJhc2EgQ2hhbXBpb25zIn0.n3ZZliA3fKJkhpZyLDyz4xi-FZBwB-S926MIEkdWU9oey0Jq1U0pJUwdhLqvAqVOvZUALf_tu_rY4mTvbpSGARdwVaiRiJDfemCD2K-n0h5zAR9WgiAs7Ian9aaIYRVzq9RFuI3F22BnZfxIucZvzTQHSyDa1Q4holveD-dNmxiQLzi80694BnRm-rABzGNXlA4llzl4CpZsqCAQD01AoHDKPyc9J2eSwmhiMbb70P1VtEd0QjEo1T_SXPvoAI4TcAOT51ZxqxJQW6AgplIzE4CD_S2weooGeG2Jw6kjYIsUEm5OLqMgvgc1dAvmVhVrwcEXtMZEvULil-dnrJKvAg';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessageToRasa = async (message: string): Promise<string> => {
    try {
      // Simulation de l'API RASA avec réponses intelligentes
      const responses = {
        'comment créer un template': 'Pour créer un template, allez dans la section "Templates" et cliquez sur "Nouveau Template". Vous pourrez ensuite utiliser l\'éditeur pour personnaliser votre certificat avec tous les outils disponibles.',
        'comment approuver une demande': 'Pour approuver une demande, allez dans le tableau de bord, trouvez le participant et cliquez sur "Approuver". Vous pourrez choisir entre une approbation complète (avec saisie des détails) ou rapide (nom automatique).',
        'comment modifier un template': 'Dans la section Templates, cliquez sur "Personnaliser" sur le template souhaité. L\'éditeur s\'ouvrira avec tous les outils Photoshop disponibles.',
        'quels outils sont disponibles': 'L\'éditeur dispose de tous les outils Photoshop : sélection (V,M,L,W), peinture (B), texte (T), formes (U), navigation (H,Z), et bien plus. Plus de 40 polices Google Fonts et des milliers d\'icônes sont disponibles.',
        'comment envoyer un certificat': 'Les certificats sont envoyés automatiquement par email lors de l\'approbation. Vous pouvez aussi renvoyer un certificat depuis l\'historique.',
        'où voir les statistiques': 'Les statistiques sont disponibles dans la section "Statistiques" du menu admin. Vous y trouverez les données de performance et les graphiques.',
        'comment configurer l\'organisation': 'Allez dans "Paramètres" pour configurer les informations de votre organisation, uploader votre logo et signature, et personnaliser les templates d\'email.',
        'problème avec template': 'Si vous rencontrez un problème avec un template, vérifiez que tous les éléments sont bien positionnés et que les variables {{participantName}} sont correctement placées.',
        'comment exporter': 'Vous pouvez exporter les données en CSV depuis l\'historique, ou télécharger les templates depuis la section Templates.',
        'aide raccourcis': 'Raccourcis disponibles : V (déplacer), M (sélection), L (lasso), W (baguette), B (pinceau), T (texte), U (formes), H (main), Z (zoom), E (gomme), G (dégradé), S (tampon), J (correction), P (plume), C (recadrage), K (tranche).'
      };

      // Recherche de réponse basée sur les mots-clés
      const lowerMessage = message.toLowerCase();
      for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key) || key.split(' ').some(word => lowerMessage.includes(word))) {
          return response;
        }
      }

      // Réponse par défaut avec suggestions
      return `Je comprends votre question sur "${message}". Voici ce que je peux vous aider :

📋 **Gestion des demandes** : Approuver, rejeter, voir l'historique
🎨 **Templates** : Créer et personnaliser avec l'éditeur complet
📊 **Statistiques** : Voir les performances et données
⚙️ **Paramètres** : Configurer votre organisation
📧 **Emails** : Envoi automatique des certificats

Posez-moi une question plus spécifique pour une aide détaillée !`;

    } catch (error) {
      console.error('Erreur RASA:', error);
      return 'Désolé, je rencontre un problème technique. Pouvez-vous reformuler votre question ?';
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToRasa(inputText);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant BIMADES</h3>
            <p className="text-xs text-blue-100">En ligne</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto h-[480px]">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Tapez votre message..."
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                'Comment créer un template ?',
                'Comment approuver une demande ?',
                'Quels outils sont disponibles ?',
                'Aide raccourcis clavier'
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInputText(question);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;