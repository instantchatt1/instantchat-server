const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Limite : 20 messages par IP par heure
const rateLimit = {};
function checkLimit(ip) {
  const now = Date.now();
  if (!rateLimit[ip]) rateLimit[ip] = [];
  rateLimit[ip] = rateLimit[ip].filter(t => now - t < 3600000);
  if (rateLimit[ip].length >= 20) return false;
  rateLimit[ip].push(now);
  return true;
}

const CLIENTS = {
  'boutique1': {
    name: 'Boutique Demo',
    prompt: `Tu es un assistant support client pour la boutique "Boutique Demo".
Tu réponds uniquement en français, avec un ton amical et professionnel.
Tu connais ces informations :
- Délais de livraison : 3 à 5 jours ouvrés
- Politique de retour : 30 jours après réception
- Si tu ne sais pas répondre à une question, dis-le honnêtement et invite le client à contacter l'équipe par email.
Ne réponds jamais à des sujets qui ne concernent pas la boutique.`
  },
  'maisondoree': {
    name: 'Maison Dorée',
    prompt: `Tu es un assistant support client pour "Maison Dorée", une boutique de bougies et accessoires de décoration.
Tu réponds uniquement en français, avec un ton chaleureux et élégant.
Tu connais ces informations :
- Produits : bougies artisanales, diffuseurs, accessoires de décoration
- Délais de livraison : 3 à 5 jours ouvrés
- Politique de retour : 30 jours après réception
- Email contact : contact@maisondoree.fr
Si tu ne sais pas répondre, invite le client à contacter l'équipe par email.`
  }
};

app.post('/chat/:clientId', async (req, res) => {
  const { clientId } = req.params;
  const { messages } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!checkLimit(ip)) {
    return res.status(429).json({ 
      error: 'Limite atteinte. Réessayez dans une heure.' 
    });
  }

  const client = CLIENTS[clientId];
  if (!client) return res.status(404).json({ error: 'Client introuvable' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: client.prompt,
        messages: messages
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ 
      error: 'Une erreur est survenue. Veuillez réessayer.' 
    });
  }
});

app.get('/', (req, res) => res.send('InstantChat server running !'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
