import React from 'react';
import { X as XIcon, Printer as PrinterIcon } from 'lucide-react';
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

  // Données structurées pour le QR Code
  const qrData = JSON.stringify({
    id: equipment._id,
    nom: equipment.nom,
    serial: equipment.numeroSerie,
    type: equipment.type,
    date: equipment.dateAchat || 'N/A'
  });

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>QR Code - ${equipment.nom}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px auto; width: fit-content; border: 1px solid #ddd; padding: 15px; }
            .info { margin-top: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>QR Code - ${equipment.nom}</h2>
          <div class="qr-container">
            <svg viewBox="0 0 200 200" width="200" height="200">
              ${document.getElementById('qr-svg')?.innerHTML}
            </svg>
          </div>
          <div class="info">
            <p><strong>Numéro de série:</strong> ${equipment.numeroSerie}</p>
            <p><strong>Type:</strong> ${equipment.type}</p>
            ${equipment.statut ? `<p><strong>Statut:</strong> ${equipment.statut}</p>` : ''}
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
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            QR Code - {equipment.nom}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Fermer"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <QRCodeSVG 
                id="qr-svg"
                value={qrData} 
                size={200}
                level="H"  // Niveau de correction d'erreur élevé
                includeMargin={true}
                fgColor="#1e40af"  // Couleur bleue plus foncée
              />
            </div>

            <div className="text-sm text-gray-600 text-center space-y-1">
              <p className="font-medium">Numéro de série: {equipment.numeroSerie}</p>
              <p>Type: {equipment.type}</p>
              {equipment.statut && (
                <p>Statut: <span className="capitalize">{equipment.statut.toLowerCase()}</span></p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <PrinterIcon className="h-5 w-5" />
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;