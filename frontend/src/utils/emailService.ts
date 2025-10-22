// Service simulé pour les notifications email
export const emailService = {
  sendEmail: (to: string, subject: string, content: string) => {
    console.log('Email envoyé:', {
      to,
      subject,
      content
    });
    // Dans une vraie application, ceci serait connecté à un service d'email
    return Promise.resolve({
      success: true
    });
  },
  // Templates d'emails prédéfinis
  templates: {
    newIncident: (incidentDetails: any) => ({
      subject: `Nouvel incident : ${incidentDetails.title}`,
      content: `Un nouvel incident a été signalé :
        - Titre : ${incidentDetails.title}
        - Équipement : ${incidentDetails.equipment}
        - Priorité : ${incidentDetails.priority}
        - Description : ${incidentDetails.description}`
    }),
    maintenancePlanned: (maintenanceDetails: any) => ({
      subject: `Maintenance planifiée : ${maintenanceDetails.title}`,
      content: `Une maintenance a été planifiée :
        - Titre : ${maintenanceDetails.title}
        - Équipement : ${maintenanceDetails.equipment}
        - Date : ${maintenanceDetails.scheduledDate}
        - Technicien : ${maintenanceDetails.technician}`
    }),
    equipmentAssigned: (equipmentDetails: any) => ({
      subject: `Attribution d'équipement : ${equipmentDetails.name}`,
      content: `Un équipement vous a été attribué :
        - Nom : ${equipmentDetails.name}
        - Type : ${equipmentDetails.type}
        - Numéro de série : ${equipmentDetails.serialNumber}`
    })
  }
};