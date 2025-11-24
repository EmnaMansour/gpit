import React from 'react';
import { X, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface Equipment {
  _id: string;
  nom: string;
  numeroSerie: string;
  type: string;
  statut?: string;
  dateAchat?: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  equipment
}) => {
  if (!isOpen || !equipment) return null;

  // ✅ URL CORRECTE qui pointe vers votre backend
  // IMPORTANT: Changez 'localhost:8000' si votre backend est ailleurs
  const backendUrl = 'http://localhost:8000';
  
  // QR Code contient l'URL vers la page de détails sur le backend
  const qrData = `${backendUrl}/scan/equipment/${equipment._id}`;
  
  // Autres options disponibles :
  // Par numéro de série: `${backendUrl}/scan/equipment/serial/${encodeURIComponent(equipment.numeroSerie)}`
  // Par nom: `${backendUrl}/scan/equipment/name/${encodeURIComponent(equipment.nom)}`

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>QR Code - ${equipment.nom}</title>
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              text-align: center; 
              padding: 20px;
              background: #f7fafc;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            h2 { 
              color: #1e40af; 
              margin-bottom: 20px;
              font-size: 24px;
            }
            .qr-container { 
              margin: 20px auto; 
              width: fit-content; 
              border: 3px solid #e2e8f0; 
              padding: 15px; 
              border-radius: 12px;
              background: white;
            }
            .info { 
              margin-top: 20px; 
              font-size: 14px;
              text-align: left;
              background: #f7fafc;
              padding: 15px;
              border-radius: 8px;
            }
            .info p {
              margin: 8px 0;
              color: #2d3748;
            }
            .info strong {
              color: #1e40af;
            }
            .instruction { 
              margin-top: 15px; 
              font-size: 13px; 
              color: #718096; 
              font-style: italic;
              padding: 10px;
              background: #edf2f7;
              border-radius: 6px;
            }
            .url-display {
              margin-top: 15px;
              font-size: 10px;
              color: #a0aec0;
              word-break: break-all;
              padding: 8px;
              background: #edf2f7;
              border-radius: 4px;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>📦 ${equipment.nom}</h2>
            <div class="qr-container">
              <svg viewBox="0 0 200 200" width="200" height="200">
                ${document.getElementById('qr-svg')?.innerHTML}
              </svg>
            </div>
            <div class="info">
              <p><strong>Numéro de série:</strong> ${equipment.numeroSerie}</p>
              <p><strong>Type:</strong> ${equipment.type}</p>
              ${equipment.statut ? `<p><strong>Statut:</strong> ${equipment.statut}</p>` : ''}
              ${equipment.dateAchat ? `<p><strong>Date d'achat:</strong> ${new Date(equipment.dateAchat).toLocaleDateString('fr-FR')}</p>` : ''}
            </div>
            <div class="instruction">
              📱 Scannez ce code QR avec votre smartphone<br>
              pour voir tous les détails de cet équipement
            </div>
            <div class="url-display">
              ${qrData}
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-xl font-semibold text-white">
            📱 QR Code - {equipment.nom}
          </h2>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col items-center space-y-4">
            {/* QR Code */}
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <QRCodeSVG 
                id="qr-svg"
                value={qrData} 
                size={200}
                level="H"
                includeMargin={true}
                fgColor="#1e40af"
              />
            </div>

            {/* Equipment Info */}
            <div className="w-full bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">N° Série:</span>
                <span className="font-semibold">{equipment.numeroSerie}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Type:</span>
                <span className="font-semibold">{equipment.type}</span>
              </div>
              {equipment.statut && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">Statut:</span>
                  <span className="font-semibold capitalize">{equipment.statut.toLowerCase()}</span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-700 font-medium">
                📱 Scannez avec votre smartphone pour voir tous les détails
              </p>
            </div>

            {/* URL Display */}
            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1">URL générée :</p>
              <div className="bg-gray-100 rounded p-2 text-xs text-gray-600 break-all font-mono">
                {qrData}
              </div>
            </div>
          </div>

          {/* Print Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <Printer className="h-5 w-5" />
              Imprimer l'étiquette
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;