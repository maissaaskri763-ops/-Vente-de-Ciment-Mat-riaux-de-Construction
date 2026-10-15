import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import readXlsxFile from 'read-excel-file/node';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { forecastClientConsumption } from './services/clientForecast.js';
import { answerExecutiveQuestion } from './services/executiveAssistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load this backend's local configuration, regardless of the launch directory.
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'vent-app-development-secret-change-me';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configure Multer for File Uploads
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// In-Memory Data Cache
let cachedData = {
  summary: null,
  customers: [],
  products: [],
  governorates: [],
  monthly: [],
  transactions: []
};
let users = [];

// Load JSON datasets on boot
const loadLocalDatasets = () => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = {
      'summary.json': 'summary',
      'customers.json': 'customers',
      'products.json': 'products',
      'governorates.json': 'governorates',
      'monthly.json': 'monthly',
      'transactions_sample.json': 'transactions'
    };

    for (const [filename, key] of Object.entries(files)) {
      const filepath = path.join(dataDir, filename);
      if (fs.existsSync(filepath)) {
        cachedData[key] = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      }
    }
    const usersPath = path.join(dataDir, 'users.json');
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
    console.log('✅ All datasets loaded successfully.');
  } catch (err) {
    console.error('❌ Error loading datasets:', err.message);
  }
};

loadLocalDatasets();

// --- REST API ENDPOINTS ---

const createToken = (user) => jwt.sign(
  { sub: user.id, username: user.username, role: user.role, displayName: user.displayName },
  JWT_SECRET,
  { expiresIn: '8h' }
);

const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Authentication required.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired session.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ status: 'error', message: 'You do not have permission for this action.' });
  }
  return next();
};

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = users.find((candidate) => candidate.username === username);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ status: 'error', message: 'Invalid username or password.' });
  }

  return res.json({
    status: 'success',
    token: createToken(user),
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({ status: 'success', user: req.user });
});

app.use('/api', authenticate);

// 1. Executive Summary & KPIs
app.get('/api/kpis', (req, res) => {
  try {
    return res.json({
      status: 'success',
      data: cachedData.summary || {}
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 2. Monthly Trend Data
app.get('/api/monthly', (req, res) => {
  try {
    return res.json({
      status: 'success',
      data: cachedData.monthly || []
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 3. Product Catalog Metrics
app.get('/api/products', (req, res) => {
  try {
    return res.json({
      status: 'success',
      data: cachedData.products || []
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 4. Governorate / Regional Distribution
app.get('/api/governorates', (req, res) => {
  try {
    return res.json({
      status: 'success',
      data: cachedData.governorates || []
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 5. Customer CRM & Credit Risk
app.get('/api/customers', (req, res) => {
  try {
    let list = cachedData.customers || [];
    const { minCreditRatio, search, sortBy } = req.query;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.name?.toLowerCase().includes(q) || 
        c.code?.toLowerCase().includes(q)
      );
    }

    if (minCreditRatio) {
      const ratio = parseFloat(minCreditRatio);
      if (!isNaN(ratio)) {
        list = list.filter(c => c.credit_ratio >= ratio);
      }
    }

    if (sortBy === 'credit') {
      list = [...list].sort((a, b) => b.credit_ratio - a.credit_ratio);
    } else if (sortBy === 'quantity') {
      list = [...list].sort((a, b) => b.quantity - a.quantity);
    } else {
      list = [...list].sort((a, b) => b.revenue - a.revenue);
    }

    return res.json({
      status: 'success',
      total: list.length,
      data: list
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 6. Transactions Search & Pagination
app.get('/api/transactions', (req, res) => {
  try {
    let list = cachedData.transactions || [];
    const { search, product, gouv, payment, page = 1, limit = 20 } = req.query;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => 
        t.nom_cli?.toLowerCase().includes(q) || 
        t.num_liv?.toLowerCase().includes(q) ||
        t.cod_cli?.toLowerCase().includes(q)
      );
    }

    if (product && product !== 'ALL') {
      list = list.filter(t => t.abrv_art === product);
    }

    if (gouv && gouv !== 'ALL') {
      list = list.filter(t => t.lib_gouv === gouv);
    }

    if (payment && payment !== 'ALL') {
      list = list.filter(t => t.typ_regl === payment);
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const startIndex = (p - 1) * l;
    const paginatedData = list.slice(startIndex, startIndex + l);

    return res.json({
      status: 'success',
      totalRecords: list.length,
      totalPages: Math.ceil(list.length / l),
      currentPage: p,
      data: paginatedData
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// 7. cimenterie-agent-dev: auditable client-level consumption forecast.
// POST accepts either a supplied transaction history or a client_id from local data.
app.post('/api/client-forecast', (req, res) => {
  try {
    const { client_id, clientId, transactions, period_months, periodMonths } = req.body || {};
    const resolvedClientId = client_id ?? clientId;
    const history = Array.isArray(transactions)
      ? transactions
      : cachedData.transactions.filter((transaction) => String(transaction.cod_cli) === String(resolvedClientId));

    if (!resolvedClientId && !Array.isArray(transactions)) {
      return res.status(400).json({ error: 'client_id ou transactions est requis.' });
    }

    // The response intentionally has no envelope: it is the strict agent output.
    return res.json(forecastClientConsumption({
      clientId: resolvedClientId,
      transactions: history,
      periodMonths: period_months ?? periodMonths ?? 3
    }));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Executive assistant: Claude interprets only tool-returned business data.
app.post('/api/executive-assistant', async (req, res) => {
  try {
    const { message, mode = 'chat', client_id: clientId } = req.body || {};
    if (!['chat', 'client_summary'].includes(mode)) return res.status(400).json({ error: 'mode invalide.' });
    if (mode === 'client_summary' && !clientId) return res.status(400).json({ error: 'client_id est requis pour une synthèse client.' });
    const result = await answerExecutiveQuestion({
      message,
      mode,
      clientId,
      data: cachedData,
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash'
    });
    return res.json(result);
  } catch (error) {
    const status = error.message.includes('ANTHROPIC_API_KEY') ? 503 : 400;
    return res.status(status).json({ error: error.message });
  }
});

// 8. AI Sales Trend Forecast & Scenario Simulator
app.get('/api/forecast', (req, res) => {
  try {
    const priceChangePercent = parseFloat(req.query.priceChange || 0);
    const volumeGrowthPercent = parseFloat(req.query.volumeGrowth || 0);

    const baseMonthly = cachedData.monthly || [];
    if (baseMonthly.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No historical data available for forecasting' 
      });
    }

    const historicalAvgMonthlyRev = baseMonthly.reduce((acc, m) => acc + (m.revenue || 0), 0) / baseMonthly.length;
    const historicalAvgMonthlyQty = baseMonthly.reduce((acc, m) => acc + (m.quantity || 0), 0) / baseMonthly.length;

    // Generate 6-month predictive projection
    const forecastMonths = ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'];
    const simulatedMonthly = forecastMonths.map((m, idx) => {
      const seasonalFactor = 1 + Math.sin(idx) * 0.08;
      const projectedQty = historicalAvgMonthlyQty * (1 + volumeGrowthPercent / 100) * seasonalFactor;
      const projectedRev = historicalAvgMonthlyRev * (1 + priceChangePercent / 100) * (1 + volumeGrowthPercent / 100) * seasonalFactor;
      return {
        month: m,
        projectedRevenue: round(projectedRev, 2),
        projectedQuantity: round(projectedQty, 2),
        confidenceIndex: 94 - idx * 2
      };
    });

    const totalSimulatedRevenue = simulatedMonthly.reduce((acc, m) => acc + m.projectedRevenue, 0);
    const revenueDelta = totalSimulatedRevenue - (historicalAvgMonthlyRev * 6);

    return res.json({
      status: 'success',
      parameters: { priceChangePercent, volumeGrowthPercent },
      summary: {
        sixMonthProjectedRevenue: round(totalSimulatedRevenue, 2),
        estimatedRevenueDelta: round(revenueDelta, 2),
        growthTrend: revenueDelta >= 0 ? '+POSITIVE' : '-NEGATIVE'
      },
      projections: simulatedMonthly
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// Helper round function
const round = (val, decimals = 2) => Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);

const server = app.listen(PORT, () => {
  console.log(`🚀 Sales Dashboard MERN Backend running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other backend instance or change PORT.`);
    process.exit(1);
  }

  console.error('Server startup error:', err.message);
  process.exit(1);
});

// 8. Excel File Upload Handler
app.post('/api/upload', requireRole('admin', 'manager'), upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No Excel file uploaded.' });
  }

  try {
    const extension = path.extname(req.file.originalname).toLowerCase();
    if (extension !== '.xlsx') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: 'error', message: 'Only .xlsx files are supported.' });
    }

    const parsedWorkbook = await readXlsxFile(req.file.path);
    const rows = Array.isArray(parsedWorkbook?.[0]?.data)
      ? parsedWorkbook[0].data
      : parsedWorkbook;

    if (!rows || rows.length < 2) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: 'error', message: 'Excel file is empty or formatted incorrectly.' });
    }

    const headers = rows[0].map((header) => String(header || '').trim());
    const jsonRows = rows.slice(1).reduce((records, row) => {
      const record = {};
      row.forEach((cell, index) => {
        const header = headers[index];
        if (header) record[header] = cell;
      });

      if (Object.keys(record).length > 0) {
        records.push(record);
      }

      return records;
    }, []);

    if (!jsonRows || jsonRows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: 'error', message: 'Excel file is empty or formatted incorrectly.' });
    }

    // Process uploaded rows
    let uploadRev = 0;
    let uploadQty = 0;
    const custMap = {};
    const prodMap = {};

    jsonRows.forEach(r => {
      const mnt = parseFloat(r.MNT_TTC_ART || r.mnt_ttc || r.Montant || 0);
      const qty = parseFloat(r.QTE_LIV || r.qte_liv || r.Quantite || 0);
      const cli = r.NOM_CLI || r.nom_cli || 'Client Importé';
      const prod = r.ABRV_ART || r.abrv_art || 'Produit Importé';

      uploadRev += mnt;
      uploadQty += qty;
      custMap[cli] = (custMap[cli] || 0) + mnt;
      prodMap[prod] = (prodMap[prod] || 0) + mnt;
    });

    // Cleanup temp uploaded file
    fs.unlinkSync(req.file.path);

    return res.json({
      status: 'success',
      message: `Processed ${jsonRows.length} rows successfully!`,
      metrics: {
        records: jsonRows.length,
        totalRevenue: round(uploadRev, 2),
        totalQuantity: round(uploadQty, 2),
        topClient: Object.entries(custMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

