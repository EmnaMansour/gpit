// import React, { useState } from 'react'
// import { PricingSection } from '../components/PricingSection'
// import { CheckIcon } from 'lucide-react'
// export function Pricing() {
//   const [annualBilling, setAnnualBilling] = useState(true)
//   return (
//     <div className="w-full">
//       {/* Hero Section */}
//       <div className="bg-blue-900 text-white py-16">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-6">
//               Tarifs simples et transparents
//             </h1>
//             <p className="text-xl text-blue-100">
//               Choisissez le plan qui correspond le mieux aux besoins de votre
//               entreprise. Pas de frais cachés.
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Billing Toggle */}
//       <div className="bg-white pt-16 pb-8">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-center items-center mb-8">
//             <span
//               className={`mr-3 text-lg ${annualBilling ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
//             >
//               Facturation annuelle
//             </span>
//             <button
//               className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${annualBilling ? 'bg-gray-200' : 'bg-blue-600'}`}
//               onClick={() => setAnnualBilling(!annualBilling)}
//             >
//               <span
//                 className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow transition-transform duration-300 ${annualBilling ? '' : 'transform translate-x-8'}`}
//               />
//             </button>
//             <span
//               className={`ml-3 text-lg ${!annualBilling ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
//             >
//               Facturation mensuelle
//             </span>
//           </div>
//           {annualBilling && (
//             <div className="text-center text-green-600 font-medium mb-8">
//               Économisez 20% avec la facturation annuelle
//             </div>
//           )}
//         </div>
//       </div>
//       {/* Pricing Tables */}
//       <PricingSection />
//       {/* Feature Comparison */}
//       <div className="py-20 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold mb-4">
//               Comparaison des fonctionnalités
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Découvrez en détail ce qui est inclus dans chaque plan.
//             </p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="py-4 px-6 text-left text-gray-900 font-semibold">
//                     Fonctionnalité
//                   </th>
//                   <th className="py-4 px-6 text-center text-gray-900 font-semibold">
//                     Essentiel
//                   </th>
//                   <th className="py-4 px-6 text-center text-blue-600 font-semibold">
//                     Professionnel
//                   </th>
//                   <th className="py-4 px-6 text-center text-gray-900 font-semibold">
//                     Entreprise
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {[
//                   {
//                     name: "Nombre d'appareils",
//                     essential: "Jusqu'à 25",
//                     professional: "Jusqu'à 100",
//                     enterprise: 'Illimité',
//                   },
//                   {
//                     name: 'Surveillance en temps réel',
//                     essential: true,
//                     professional: true,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Gestion à distance',
//                     essential: 'Basique',
//                     professional: 'Complète',
//                     enterprise: 'Complète',
//                   },
//                   {
//                     name: 'Automatisation des tâches',
//                     essential: false,
//                     professional: true,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Rapports personnalisés',
//                     essential: false,
//                     professional: true,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Intégration avec les outils tiers',
//                     essential: false,
//                     professional: true,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Support',
//                     essential: 'Email',
//                     professional: 'Prioritaire',
//                     enterprise: '24/7',
//                   },
//                   {
//                     name: 'Gestionnaire de compte dédié',
//                     essential: false,
//                     professional: false,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'API complète',
//                     essential: false,
//                     professional: false,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Déploiement sur site',
//                     essential: false,
//                     professional: false,
//                     enterprise: true,
//                   },
//                   {
//                     name: 'Personnalisation avancée',
//                     essential: false,
//                     professional: false,
//                     enterprise: true,
//                   },
//                 ].map((feature, index) => (
//                   <tr
//                     key={index}
//                     className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                   >
//                     <td className="py-4 px-6 text-gray-900 font-medium">
//                       {feature.name}
//                     </td>
//                     <td className="py-4 px-6 text-center">
//                       {typeof feature.essential === 'boolean' ? (
//                         feature.essential ? (
//                           <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )
//                       ) : (
//                         <span>{feature.essential}</span>
//                       )}
//                     </td>
//                     <td className="py-4 px-6 text-center bg-blue-50">
//                       {typeof feature.professional === 'boolean' ? (
//                         feature.professional ? (
//                           <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )
//                       ) : (
//                         <span className="font-medium">
//                           {feature.professional}
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-4 px-6 text-center">
//                       {typeof feature.enterprise === 'boolean' ? (
//                         feature.enterprise ? (
//                           <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
//                         ) : (
//                           <span className="text-gray-400">—</span>
//                         )
//                       ) : (
//                         <span>{feature.enterprise}</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//       {/* FAQ Section */}
//       <div className="py-16 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-4">
//               Questions fréquentes sur les tarifs
//             </h2>
//             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//               Trouvez des réponses aux questions les plus courantes concernant
//               nos plans et tarifs.
//             </p>
//           </div>
//           <div className="max-w-4xl mx-auto">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {[
//                 {
//                   question: 'Y a-t-il des frais de configuration ?',
//                   answer:
//                     "Non, il n'y a pas de frais de configuration pour nos plans standard. Pour le plan Entreprise avec des besoins de personnalisation avancés, des frais peuvent s'appliquer selon vos exigences spécifiques.",
//                 },
//                 {
//                   question: 'Puis-je changer de plan à tout moment ?',
//                   answer:
//                     'Oui, vous pouvez passer à un plan supérieur à tout moment. Le changement prend effet immédiatement et la facturation est ajustée au prorata. Pour passer à un plan inférieur, le changement prendra effet à la fin de votre période de facturation.',
//                 },
//                 {
//                   question:
//                     'Proposez-vous des remises pour les organisations à but non lucratif ?',
//                   answer:
//                     "Oui, nous offrons des remises spéciales pour les organisations à but non lucratif, les établissements d'enseignement et les startups. Contactez notre équipe commerciale pour en savoir plus.",
//                 },
//                 {
//                   question: 'Comment fonctionne la facturation par appareil ?',
//                   answer:
//                     "Nos tarifs sont basés sur le nombre d'appareils que vous surveillez. Un appareil peut être un ordinateur, un serveur, un équipement réseau ou tout autre dispositif compatible avec notre plateforme.",
//                 },
//                 {
//                   question:
//                     "L'essai gratuit inclut-il toutes les fonctionnalités ?",
//                   answer:
//                     "Oui, notre essai gratuit de 14 jours vous donne accès à toutes les fonctionnalités du plan Professionnel, avec une limite de 10 appareils. Aucune carte de crédit n'est requise pour commencer.",
//                 },
//                 {
//                   question: 'Quels modes de paiement acceptez-vous ?',
//                   answer:
//                     'Nous acceptons les cartes de crédit (Visa, Mastercard, American Express), les virements bancaires et, pour les plans Entreprise, nous pouvons établir des factures pour paiement par chèque ou virement.',
//                 },
//               ].map((faq, index) => (
//                 <div key={index} className="bg-gray-50 rounded-lg p-6">
//                   <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
//                   <p className="text-gray-700">{faq.answer}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* CTA Section */}
//       <div className="py-16 bg-blue-600 text-white">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold mb-6">
//             Vous avez d'autres questions ?
//           </h2>
//           <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
//             Notre équipe est prête à vous aider à trouver le plan qui correspond
//             le mieux à vos besoins.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-4">
//             <button className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50">
//               Contacter les ventes
//             </button>
//             <button className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-md hover:bg-white/10">
//               Voir la documentation
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
