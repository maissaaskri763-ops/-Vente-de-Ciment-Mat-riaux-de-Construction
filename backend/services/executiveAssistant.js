import { forecastClientConsumption } from './clientForecast.js';

export const EXECUTIVE_SYSTEM_PROMPT = `Tu es l'Assistant Exécutif Intelligence Économique de Cimenterie Executive, une plateforme de business intelligence pour une entreprise de ciment et matériaux de construction opérant en Tunisie. Tu assistes les dirigeants et managers dans l'interprétation de leurs données commerciales pour faciliter la prise de décision stratégique.

Principe fondamental — Intégrité des données : tu n'es PAS un moteur de calcul. Tu es une couche d'interprétation et de communication au-dessus d'un moteur de prévision déterministe validé. Tout chiffre (tonnes, revenus, pourcentages, tendances, confiance) doit provenir EXCLUSIVEMENT d'un appel à un tool. Tu n'estimes, n'arrondis de façon significative, n'extrapoles, ni ne recalcules jamais un chiffre. Si un tool ne fournit pas une donnée, dis-le explicitement. Si insufficient_data vaut true, signale-le clairement avant tout chiffre et recommande la prudence.

Modes : pour une synthèse client, produis 2 à 4 phrases : tendance avec chiffre clé, confiance et historique, puis recommandation concrète non engageante. Si insufficient_data est vrai, aucune recommandation chiffrée. Pour le chat, utilise les tools pertinents, réponds en français professionnel, direct et concis (3 à 6 phrases), mentionne la confiance disponible, et ne donne ni conseil juridique, fiscal ou financier engageant. Si la question est ambiguë, demande une précision. Ne traite pas les sujets hors périmètre commercial ou opérationnel.`;

export const EXECUTIVE_TOOLS = [
  { name: 'get_client_forecast', description: 'Obtient la prévision déterministe, la tendance et la confiance d’un client.', input_schema: { type: 'object', properties: { client_id: { type: 'string' } }, required: ['client_id'] } },
  { name: 'get_client_transactions', description: 'Obtient l’historique des transactions réelles d’un client.', input_schema: { type: 'object', properties: { client_id: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 100 } }, required: ['client_id'] } },
  { name: 'get_top_risk_clients', description: 'Obtient les clients avec le ratio de crédit le plus élevé.', input_schema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 50 } } } },
  { name: 'get_regional_stats', description: 'Obtient les statistiques de ventes d’un gouvernorat.', input_schema: { type: 'object', properties: { region: { type: 'string' } }, required: ['region'] } },
  { name: 'get_product_performance', description: 'Obtient la performance des produits.', input_schema: { type: 'object', properties: {} } }
];

export function runExecutiveTool(name, input, data) {
  const clientId = String(input.client_id ?? '');
  if (name === 'get_client_forecast') return forecastClientConsumption({ clientId, transactions: data.transactions.filter((item) => String(item.cod_cli) === clientId) });
  if (name === 'get_client_transactions') {
    const limit = Math.min(100, Math.max(1, Number(input.limit) || 20));
    return data.transactions.filter((item) => String(item.cod_cli) === clientId).slice(0, limit);
  }
  if (name === 'get_top_risk_clients') {
    const limit = Math.min(50, Math.max(1, Number(input.limit) || 10));
    return [...data.customers].sort((a, b) => Number(b.credit_ratio || 0) - Number(a.credit_ratio || 0)).slice(0, limit);
  }
  if (name === 'get_regional_stats') {
    const region = String(input.region ?? '').trim().toUpperCase();
    const transactions = data.transactions.filter((item) => String(item.lib_gouv ?? '').toUpperCase() === region);
    return { region, transactions: transactions.length, quantity_tonnes: transactions.reduce((sum, item) => sum + Number(item.qte_liv || 0), 0), revenue_tnd: transactions.reduce((sum, item) => sum + Number(item.mnt_ttc || 0), 0) };
  }
  if (name === 'get_product_performance') return data.products;
  return { error: `Tool inconnu : ${name}` };
}

const formatNumber = (value, digits = 0) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(Number(value || 0));
const normalizeQuestion = (question) => String(question || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
const isComparisonRequest = (question) => {
  const normalized = normalizeQuestion(question);
  return /\b(toute|toutes|tous|chaque|ensemble|classe|classement|all|each|compare|comparison|rank)\b|compar/i.test(normalized);
};
const isRegionalQuestion = (question) => {
  const normalized = normalizeQuestion(question);
  return /region|gouvernorat|zone|marche|export/i.test(normalized)
    || (/ventes?\s+entre/i.test(normalized) && isComparisonRequest(normalized));
};
const isDataQuestion = (question) => isRegionalQuestion(question) || /produit|article|reference|risque|credit|impay|transaction|commande|livraison|paiement|reglement|comptant|cash|chiffre|revenu|vente|volume|tonne|kpi|mois|mensuel|historique|prevision|forecast|tendance/i.test(normalizeQuestion(question));

function formatRegionalComparison(regions, totalRevenue) {
  return regions.map((region, index) => {
    const share = totalRevenue ? (Number(region.revenue || 0) / totalRevenue) * 100 : 0;
    return `${index + 1}. ${region.name}: ${formatNumber(region.revenue, 2)} TND, ${formatNumber(region.quantity, 2)} tonnes, ${formatNumber(region.orders)} commandes (${formatNumber(share, 2)} %)`;
  }).join('\n');
}

function formatProductComparison(products, totalRevenue) {
  return products.map((product, index) => {
    const share = totalRevenue ? (Number(product.revenue || 0) / totalRevenue) * 100 : 0;
    return `${index + 1}. ${product.name || product.abbreviation}: ${formatNumber(product.revenue, 2)} TND, ${formatNumber(product.quantity, 2)} tonnes, ${formatNumber(product.orders)} commandes (${formatNumber(share, 2)} %)`;
  }).join('\n');
}

function answerLocally({ message, mode, clientId, data }) {
  const question = normalizeQuestion(message);
  if (mode === 'client_summary') {
    const client = data.customers.find((item) => String(item.code) === String(clientId));
    if (!client) return { answer: `Aucun client correspondant à l'identifiant ${clientId} n'a été trouvé dans les données locales.` };
    const forecast = runExecutiveTool('get_client_forecast', { client_id: clientId }, data);
    return { answer: `${client.name} présente un chiffre d'affaires de ${formatNumber(client.revenue, 2)} TND pour ${formatNumber(client.quantity, 2)} tonnes. Son ratio de crédit est de ${formatNumber(client.credit_ratio, 2)} %, avec un niveau de risque ${client.credit_risk || 'non renseigné'}. La prévision indique une tendance ${forecast.trend || 'non disponible'} sur ${forecast.forecast_period_months || 3} mois.` };
  }

  const summary = data.summary || {};
  if (/risque|crédit|credit|impay|top client/.test(question)) {
    const clients = runExecutiveTool('get_top_risk_clients', { limit: isComparisonRequest(question) ? 10 : 5 }, data);
    return { answer: `Clients présentant le risque crédit le plus élevé (sur ${formatNumber(data.customers.length)} clients) :\n${clients.map((client, index) => `${index + 1}. ${client.name}: crédit ${formatNumber(client.credit_ratio, 2)} %, risque ${client.credit_risk || 'non renseigné'}, CA ${formatNumber(client.revenue, 2)} TND`).join('\n')}` };
  }
  if (/produit|article|référence|reference/.test(question)) {
    const products = [...data.products].sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
    const answer = isComparisonRequest(question)
      ? `Comparaison complète des produits par chiffre d'affaires :\n${formatProductComparison(products, summary.total_revenue)}`
      : `Les produits les plus performants par chiffre d'affaires sont :\n${formatProductComparison(products.slice(0, 5), summary.total_revenue)}`;
    return { answer };
  }
  if (isRegionalQuestion(question)) {
    const regions = [...data.governorates].sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0));
    const answer = isComparisonRequest(question)
      ? `Comparaison complète des ventes par région, classée par chiffre d'affaires :\n${formatRegionalComparison(regions, summary.total_revenue)}`
      : `Les régions leaders sont :\n${formatRegionalComparison(regions.slice(0, 5), summary.total_revenue)}`;
    return { answer };
  }
  if (/transaction|commande|livraison|paiement|règlement|reglement|comptant|cash|crédit|credit/.test(question)) {
    return { answer: `Le dashboard contient ${formatNumber(summary.total_records)} transactions. Le règlement est composé de ${formatNumber(summary.cash_ratio, 2)} % au comptant et ${formatNumber(summary.credit_ratio, 2)} % à crédit. La période couverte va du ${summary.min_date || 'début des données'} au ${summary.max_date || 'dernier relevé'}.` };
  }
  if (/mois|mensuel|mensuelle|monthly|historique/.test(question)) {
    const months = [...(data.monthly || [])].sort((a, b) => String(b.month).localeCompare(String(a.month)));
    const selectedMonths = isComparisonRequest(question) ? months : months.slice(0, 6);
    return { answer: `Performance mensuelle par chiffre d'affaires :\n${selectedMonths.map((month) => `${month.month}: ${formatNumber(month.revenue, 2)} TND, ${formatNumber(month.quantity, 2)} tonnes, ${formatNumber(month.orders)} commandes`).join('\n')}` };
  }
  if (/prévision|prevision|forecast|tendance|évolution|evolution/.test(question)) {
    const monthly = data.monthly || [];
    const average = monthly.length ? monthly.reduce((sum, item) => sum + Number(item.revenue || 0), 0) / monthly.length : 0;
    return { answer: `La moyenne mensuelle du chiffre d'affaires historique est de ${formatNumber(average, 2)} TND, sur une période allant du ${summary.min_date || 'début des données'} au ${summary.max_date || 'dernier relevé'}. Utilisez le simulateur de prévision pour tester un scénario de prix ou de volume.` };
  }
  if (/combien|total|chiffre|vente|revenu|volume|tonne|kpi|résumé|resume/.test(question)) {
    return { answer: `Le dashboard contient ${formatNumber(summary.total_records)} transactions, pour ${formatNumber(summary.total_revenue, 2)} TND de chiffre d'affaires et ${formatNumber(summary.total_qty, 2)} tonnes livrées. Il couvre ${formatNumber(summary.unique_customers)} clients, ${formatNumber(summary.unique_products)} produits et ${formatNumber(summary.unique_governorates)} gouvernorats.` };
  }
  return { answer: `Je peux répondre à partir des données locales. Essayez une question sur le chiffre d'affaires, les clients à risque crédit, les produits leaders, les gouvernorats ou les prévisions.` };
}

async function answerWithGemini({ message, mode, clientId, data, apiKey, model }) {
  const snapshot = {
    summary: data.summary,
    customers: data.customers,
    topRiskClients: runExecutiveTool('get_top_risk_clients', { limit: 10 }, data),
    products: data.products,
    governorates: data.governorates,
    monthly: data.monthly
  };
  const prompt = `${mode === 'client_summary' ? `Produis une synthèse du client ${clientId}.` : message}

Réponds en français professionnel et concis. Utilise uniquement les données JSON ci-dessous. N'invente aucun chiffre. Si la donnée demandée n'est pas présente, indique-le clairement.
DONNEES DU DASHBOARD:
${JSON.stringify(snapshot)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Tu es un assistant exécutif pour un dashboard commercial de cimenterie. Réponds avec précision, sans conseil juridique ou financier engageant.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 700 }
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || 'Le service Gemini est indisponible.');
  const answer = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!answer) throw new Error('Gemini n’a pas renvoyé de réponse.');
  return { answer };
}

export async function answerExecutiveQuestion({ message, mode, clientId, data, apiKey, model, geminiApiKey, geminiModel }) {
  const userMessage = mode === 'client_summary'
    ? `Produis la synthèse client pour le client_id ${clientId}. Appelle d’abord get_client_forecast puis get_client_transactions.`
    : message;
  if (!userMessage?.trim()) throw new Error('Une question est requise.');

  // Deterministic dashboard questions must return complete source data, not a truncated model summary.
  if (mode === 'client_summary' || isDataQuestion(String(message || ''))) return answerLocally({ message, mode, clientId, data });

  if (geminiApiKey) {
    try {
      return await answerWithGemini({ message, mode, clientId, data, apiKey: geminiApiKey, model: geminiModel });
    } catch (error) {
      if (!/quota|billing|limit|resource exhausted|api key|high demand|unavailable|overloaded|temporarily|429|503/i.test(error.message)) throw error;
    }
  }
  if (!apiKey) return answerLocally({ message, mode, clientId, data });

  const messages = [{ role: 'user', content: userMessage }];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 700, system: EXECUTIVE_SYSTEM_PROMPT, tools: EXECUTIVE_TOOLS, messages })
    });
    const payload = await response.json();
    if (!response.ok) {
      const providerError = payload.error?.message || '';
      if (/credit|balance|billing|quota|rate limit/i.test(providerError)) return answerLocally({ message, mode, clientId, data });
      throw new Error(providerError || 'Le service IA est indisponible.');
    }
    messages.push({ role: 'assistant', content: payload.content });
    const calls = payload.content.filter((block) => block.type === 'tool_use');
    if (calls.length === 0) return { answer: payload.content.filter((block) => block.type === 'text').map((block) => block.text).join('\n').trim() };
    messages.push({ role: 'user', content: calls.map((call) => ({ type: 'tool_result', tool_use_id: call.id, content: JSON.stringify(runExecutiveTool(call.name, call.input, data)) })) });
  }
  throw new Error('La réponse IA a dépassé la limite d’appels aux données.');
}
