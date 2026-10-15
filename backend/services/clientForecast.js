const MONTH_MS = 30.4375 * 24 * 60 * 60 * 1000;

const round = (value, decimals = 2) => Number(Number(value).toFixed(decimals));

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthDifference(newer, older) {
  return (newer.getUTCFullYear() - older.getUTCFullYear()) * 12 + newer.getUTCMonth() - older.getUTCMonth();
}

function normalizeTransaction(transaction) {
  const dateValue = transaction.date ?? transaction.date_liv;
  const quantity = Number(transaction.quantite ?? transaction.quantity ?? transaction.qte_liv);
  const date = new Date(dateValue);

  if (!dateValue || Number.isNaN(date.getTime()) || !Number.isFinite(quantity) || quantity < 0) {
    return null;
  }

  return {
    date,
    quantity,
    product: transaction.produit ?? transaction.product ?? transaction.abrv_art,
    governorate: transaction.gouvernorat ?? transaction.governorate ?? transaction.lib_gouv,
    paymentStatus: transaction.statut_paiement ?? transaction.payment_status ?? transaction.typ_regl
  };
}

function insufficient(clientId, reason) {
  return {
    client_id: String(clientId ?? ''),
    estimation_tonnes: 0,
    periode: 'prochains 3 mois',
    niveau_confiance: 'faible',
    tendance: 'stable',
    facteurs_pris_en_compte: [reason],
    explication: "L'historique disponible ne permet pas une estimation fiable de la consommation future.",
    insufficient_data: true
  };
}

/**
 * Produces an auditable client consumption forecast from transaction history only.
 * No external model is used because quantities must never be inferred beyond data.
 */
export function forecastClientConsumption({ clientId, transactions, periodMonths = 3 }) {
  const months = Number(periodMonths);
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    throw new Error('periodMonths doit être un entier entre 1 et 12.');
  }

  const validTransactions = (Array.isArray(transactions) ? transactions : [])
    .map(normalizeTransaction)
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  if (validTransactions.length < 3) {
    return insufficient(clientId, 'moins de 3 transactions valides dans l’historique');
  }

  const latestDate = validTransactions.at(-1).date;
  const latestMonth = startOfMonth(latestDate);
  const recent = validTransactions.filter(({ date }) => monthDifference(latestMonth, startOfMonth(date)) < 3);
  const previous = validTransactions.filter(({ date }) => {
    const difference = monthDifference(latestMonth, startOfMonth(date));
    return difference >= 3 && difference < 12;
  });

  const recentMonthlyAverage = recent.reduce((sum, item) => sum + item.quantity, 0) / 3;
  const previousMonthlyAverage = previous.length > 0
    ? previous.reduce((sum, item) => sum + item.quantity, 0) / 9
    : recentMonthlyAverage;
  const weightedMonthlyAverage = recentMonthlyAverage * 0.7 + previousMonthlyAverage * 0.3;

  const priorThreeMonths = validTransactions.filter(({ date }) => {
    const difference = monthDifference(latestMonth, startOfMonth(date));
    return difference >= 3 && difference < 6;
  });
  const priorThreeAverage = priorThreeMonths.reduce((sum, item) => sum + item.quantity, 0) / 3;
  const relativeChange = priorThreeAverage > 0
    ? (recentMonthlyAverage - priorThreeAverage) / priorThreeAverage
    : 0;
  const trend = relativeChange > 0.1 ? 'croissante' : relativeChange < -0.1 ? 'décroissante' : 'stable';

  const monthsCovered = Math.max(1, monthDifference(latestMonth, startOfMonth(validTransactions[0].date)) + 1);
  const confidence = validTransactions.length >= 10 && monthsCovered >= 6
    ? 'élevé'
    : 'moyen';
  const intervals = validTransactions.slice(1).map((item, index) => item.date - validTransactions[index].date);
  const averageIntervalDays = intervals.reduce((sum, value) => sum + value, 0) / intervals.length / (24 * 60 * 60 * 1000);
  const purchasePattern = averageIntervalDays <= 45 ? 'achats réguliers' : 'achats irréguliers';

  const factors = [
    `${validTransactions.length} transactions valides analysées`,
    `pondération de 70 % sur les 3 derniers mois et de 30 % sur les 9 mois précédents`,
    purchasePattern,
    `tendance récente ${trend}`
  ];
  if (monthsCovered >= 12) factors.push('historique annuel disponible pour observer la saisonnalité');
  else factors.push('historique saisonnier insuffisant : aucun ajustement saisonnier appliqué');

  const estimate = Math.max(0, round(weightedMonthlyAverage * months));
  return {
    client_id: String(clientId ?? ''),
    estimation_tonnes: estimate,
    periode: `prochains ${months} mois`,
    niveau_confiance: confidence,
    tendance: trend,
    facteurs_pris_en_compte: factors,
    explication: `L’estimation prudente est de ${estimate} tonnes sur les ${months} prochains mois, fondée principalement sur les volumes récents observés. Le profil d’achat est ${purchasePattern} et la tendance est ${trend}.`
  };
}
