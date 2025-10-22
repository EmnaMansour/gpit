require('dotenv').config();
const axios = require('axios');

const token = process.env.HUGGING_FACE_TOKEN;

console.log('\n🔍 DIAGNOSTIC TOKEN HUGGING FACE\n');
console.log('1. Token chargé depuis .env:', token ? '✅ OUI' : '❌ NON');
console.log('2. Début du token:', token ? token.substring(0, 10) + '...' : 'AUCUN');
console.log('3. Longueur du token:', token ? token.length + ' caractères' : 'N/A');

if (!token) {
  console.log('\n❌ ERREUR: Le token n\'est pas chargé depuis .env');
  console.log('Vérifiez que le fichier .env existe et contient:');
  console.log('HUGGING_FACE_TOKEN=hf_votre_token_ici');
  process.exit(1);
}

console.log('\n4. Test de connexion à Hugging Face...\n');

axios.post(
  'https://api-inference.huggingface.co/models/gpt2',
  { inputs: 'Hello, how are you?' },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  }
)
.then(response => {
  console.log('✅ SUCCESS: Token valide et API fonctionne !');
  console.log('\nRéponse de l\'API:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n✅ Votre chatbot devrait fonctionner correctement.\n');
})
.catch(error => {
  console.log('❌ ERREUR lors de l\'appel API\n');
  
  if (error.response) {
    console.log('Status HTTP:', error.response.status);
    console.log('Message:', error.response.statusText);
    console.log('Détails:', error.response.data);
    
    if (error.response.status === 401) {
      console.log('\n🔴 PROBLÈME: Token invalide ou expiré');
      console.log('SOLUTION:');
      console.log('1. Allez sur https://huggingface.co/settings/tokens');
      console.log('2. Créez un nouveau token (type: Read)');
      console.log('3. Copiez-le dans .env: HUGGING_FACE_TOKEN=hf_...');
      console.log('4. Relancez ce test\n');
    } else if (error.response.status === 503) {
      console.log('\n🟡 Le modèle est en cours de chargement');
      console.log('Réessayez dans 30 secondes\n');
    }
  } else if (error.request) {
    console.log('❌ Pas de réponse du serveur');
    console.log('Vérifiez votre connexion internet\n');
  } else {
    console.log('❌ Erreur:', error.message, '\n');
  }
});