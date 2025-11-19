import React from 'react';

const ShortcutsHelp: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Guide des Raccourcis et Menus - Éditeur Template</h1>

      {/* Menus de la barre supérieure */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎯 Menus de la barre supérieure (et raccourcis utiles)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Menu</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fonction principale</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Raccourcis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Fichier (File)</td>
                <td className="border border-gray-300 px-4 py-2">Créer, ouvrir, enregistrer, exporter</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + N (Nouveau) • Ctrl + O (Ouvrir) • Ctrl + S (Enregistrer) • Ctrl + Shift + S (Enregistrer sous) • Ctrl + P (Imprimer)
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Édition (Edit)</td>
                <td className="border border-gray-300 px-4 py-2">Modifier, copier, coller, transformer</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + Z (Annuler) • Ctrl + Shift + Z (Rétablir) • Ctrl + C (Copier) • Ctrl + X (Couper) • Ctrl + V (Coller) • Ctrl + T (Transformation libre)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Image (Image)</td>
                <td className="border border-gray-300 px-4 py-2">Taille, réglages, recadrage</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + Alt + I (Taille de l'image) • Ctrl + Alt + C (Taille de la zone de travail)
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Calque (Layer)</td>
                <td className="border border-gray-300 px-4 py-2">Gérer les calques</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + Shift + N (Nouveau calque) • Ctrl + J (Dupliquer le calque) • Ctrl + G (Grouper) • Ctrl + E (Fusionner)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Sélection (Select)</td>
                <td className="border border-gray-300 px-4 py-2">Créer ou modifier les sélections</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + A (Tout sélectionner) • Ctrl + D (Désélectionner) • Ctrl + Shift + I (Inverser la sélection)
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Filtre (Filter)</td>
                <td className="border border-gray-300 px-4 py-2">Appliquer effets</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + F (Répéter le dernier filtre)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Affichage (View)</td>
                <td className="border border-gray-300 px-4 py-2">Zoom, règles, guides</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + + (Zoom avant) • Ctrl + - (Zoom arrière) • Ctrl + 0 (Adapter à l'écran) • Ctrl + R (Afficher les règles)
                </td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Fenêtre (Window)</td>
                <td className="border border-gray-300 px-4 py-2">Afficher ou masquer les panneaux</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + F7 (Calques) • Ctrl + F6 (Couleur)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Aide (Help)</td>
                <td className="border border-gray-300 px-4 py-2">Documentation, recherche</td>
                <td className="border border-gray-300 px-4 py-2">
                  Ctrl + F1 (Aide Photoshop)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Barre d'outils */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🎨 Barre d'outils (à gauche)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Outil</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fonction</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Raccourci</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Outil Déplacement</td>
                <td className="border border-gray-300 px-4 py-2">Déplacer objets et calques</td>
                <td className="border border-gray-300 px-4 py-2">V</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Outil Sélection rectangulaire</td>
                <td className="border border-gray-300 px-4 py-2">Sélection en rectangle</td>
                <td className="border border-gray-300 px-4 py-2">M</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Outil Lasso</td>
                <td className="border border-gray-300 px-4 py-2">Sélection libre</td>
                <td className="border border-gray-300 px-4 py-2">L</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Baguette magique / Sélection rapide</td>
                <td className="border border-gray-300 px-4 py-2">Sélection par couleur</td>
                <td className="border border-gray-300 px-4 py-2">W</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Recadrage (Crop)</td>
                <td className="border border-gray-300 px-4 py-2">Rogner une image</td>
                <td className="border border-gray-300 px-4 py-2">C</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Pipette (Eyedropper)</td>
                <td className="border border-gray-300 px-4 py-2">Prélever une couleur</td>
                <td className="border border-gray-300 px-4 py-2">I</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Pinceau (Brush)</td>
                <td className="border border-gray-300 px-4 py-2">Peindre</td>
                <td className="border border-gray-300 px-4 py-2">B</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Tampon de duplication (Clone Stamp)</td>
                <td className="border border-gray-300 px-4 py-2">Copier des zones d'image</td>
                <td className="border border-gray-300 px-4 py-2">S</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Correcteur (Healing Brush)</td>
                <td className="border border-gray-300 px-4 py-2">Supprimer imperfections</td>
                <td className="border border-gray-300 px-4 py-2">J</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Gomme (Eraser)</td>
                <td className="border border-gray-300 px-4 py-2">Effacer</td>
                <td className="border border-gray-300 px-4 py-2">E</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Dégradé / Pot de peinture</td>
                <td className="border border-gray-300 px-4 py-2">Remplir une zone</td>
                <td className="border border-gray-300 px-4 py-2">G</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Texte (Type)</td>
                <td className="border border-gray-300 px-4 py-2">Ajouter du texte</td>
                <td className="border border-gray-300 px-4 py-2">T</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Plume (Pen)</td>
                <td className="border border-gray-300 px-4 py-2">Tracer des formes vectorielles</td>
                <td className="border border-gray-300 px-4 py-2">P</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Main (Hand)</td>
                <td className="border border-gray-300 px-4 py-2">Déplacer la vue</td>
                <td className="border border-gray-300 px-4 py-2">Maintenir Espace</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Zoom</td>
                <td className="border border-gray-300 px-4 py-2">Agrandir / réduire</td>
                <td className="border border-gray-300 px-4 py-2">Z</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Couleurs avant/arrière-plan</td>
                <td className="border border-gray-300 px-4 py-2">Intervertir</td>
                <td className="border border-gray-300 px-4 py-2">X</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Réinitialiser couleurs par défaut (noir/blanc)</td>
                <td className="border border-gray-300 px-4 py-2">—</td>
                <td className="border border-gray-300 px-4 py-2">D</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Barre latérale droite */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">⚙️ Barre latérale droite (panneaux et propriétés)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Panneau</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fonction</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Raccourci</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Calques (Layers)</td>
                <td className="border border-gray-300 px-4 py-2">Voir, renommer, masquer, verrouiller les calques</td>
                <td className="border border-gray-300 px-4 py-2">F7</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Propriétés (Properties)</td>
                <td className="border border-gray-300 px-4 py-2">Modifier paramètres d'un calque sélectionné</td>
                <td className="border border-gray-300 px-4 py-2">—</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Historique (History)</td>
                <td className="border border-gray-300 px-4 py-2">Annuler, revenir en arrière</td>
                <td className="border border-gray-300 px-4 py-2">Ctrl + Alt + Z (plusieurs retours)</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Couleur (Color)</td>
                <td className="border border-gray-300 px-4 py-2">Choisir une couleur précise</td>
                <td className="border border-gray-300 px-4 py-2">F6</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Caractère (Character)</td>
                <td className="border border-gray-300 px-4 py-2">Police, taille, interlignes du texte</td>
                <td className="border border-gray-300 px-4 py-2">Ctrl + T</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Paragraphe (Paragraph)</td>
                <td className="border border-gray-300 px-4 py-2">Alignement, retrait du texte</td>
                <td className="border border-gray-300 px-4 py-2">—</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-medium">Ajustements (Adjustments)</td>
                <td className="border border-gray-300 px-4 py-2">Correction rapide (luminosité, contraste, niveaux…)</td>
                <td className="border border-gray-300 px-4 py-2">—</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 font-medium">Navigation (Navigator)</td>
                <td className="border border-gray-300 px-4 py-2">Zoom rapide et aperçu</td>
                <td className="border border-gray-300 px-4 py-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Raccourcis généraux */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">⚡ Raccourcis généraux les plus utilisés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Actions de base</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Nouveau document:</strong> Ctrl + N</li>
              <li><strong>Ouvrir un fichier:</strong> Ctrl + O</li>
              <li><strong>Enregistrer:</strong> Ctrl + S</li>
              <li><strong>Enregistrer sous:</strong> Ctrl + Shift + S</li>
              <li><strong>Fermer le document:</strong> Ctrl + W</li>
              <li><strong>Quitter Photoshop:</strong> Ctrl + Q</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Édition</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Copier / Couper / Coller:</strong> Ctrl + C / Ctrl + X / Ctrl + V</li>
              <li><strong>Annuler / Rétablir:</strong> Ctrl + Z / Ctrl + Shift + Z</li>
              <li><strong>Dupliquer un calque:</strong> Ctrl + J</li>
              <li><strong>Fusionner les calques sélectionnés:</strong> Ctrl + E</li>
              <li><strong>Tout sélectionner / Désélectionner:</strong> Ctrl + A / Ctrl + D</li>
              <li><strong>Transformation libre:</strong> Ctrl + T</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Affichage</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Zoom avant / arrière:</strong> Ctrl + + / Ctrl + -</li>
              <li><strong>Adapter à l'écran:</strong> Ctrl + 0</li>
              <li><strong>Afficher / masquer les panneaux:</strong> Tab</li>
              <li><strong>Règles (afficher/masquer):</strong> Ctrl + R</li>
              <li><strong>Afficher la grille:</strong> Ctrl + ' (apostrophe)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Calques et autres</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Nouveau groupe de calques:</strong> Ctrl + G</li>
              <li><strong>Nouveau calque vide:</strong> Ctrl + Shift + N</li>
              <li><strong>Répéter la dernière action:</strong> Ctrl + F (pour filtres)</li>
              <li><strong>Revenir plusieurs étapes en arrière:</strong> Ctrl + Alt + Z</li>
              <li><strong>Afficher tout (Fit on Screen):</strong> Ctrl + 0</li>
              <li><strong>Fusionner tout visible:</strong> Ctrl + Shift + E</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Résumé visuel rapide */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">🧩 Résumé visuel rapide (texte)</h2>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
          <pre className="whitespace-pre-wrap">
{`---------------------------------------------------------
| Fichier | Édition | Image | Calque | Sélection | Filtre |
---------------------------------------------------------
| 🧰 Outils à gauche |  Zone de travail  | 🧩 Panneaux à droite |
|                    | (image / texte)   |  Calques, Couleurs   |
---------------------------------------------------------`}
          </pre>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-blue-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + N</strong><br />→ Nouveau
          </div>
          <div className="bg-green-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + S</strong><br />→ Enregistrer
          </div>
          <div className="bg-yellow-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + T</strong><br />→ Transformer
          </div>
          <div className="bg-purple-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + J</strong><br />→ Dupliquer un calque
          </div>
          <div className="bg-red-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + Z</strong><br />→ Annuler
          </div>
          <div className="bg-indigo-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + + / -</strong><br />→ Zoom avant / arrière
          </div>
          <div className="bg-pink-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + 0</strong><br />→ Adapter à l'écran
          </div>
          <div className="bg-teal-100 p-2 rounded text-center">
            <strong>🔹 Ctrl + Alt + Z</strong><br />→ Revenir plusieurs fois en arrière
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShortcutsHelp;