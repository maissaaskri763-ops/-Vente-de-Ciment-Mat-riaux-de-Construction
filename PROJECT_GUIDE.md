# Project guide and deep walkthrough

## 1. Project purpose

This project is a sales and operations dashboard for a cement and construction-materials company. It is designed to help management understand:

- overall business performance
- product contribution and pricing
- geographic sales concentration
- customer risk and credit exposure
- future forecast scenarios
- raw transaction-level activity

This is not a generic dashboard. It is a business intelligence prototype built around the realities of a distribution and sales environment for cement and building materials.

## 2. What each major part of the project does

### 2.1 Frontend layer

The frontend is the visual interface. It is built with React and Vite and contains all the dashboard pages.

It handles:

- screen switching between sections
- rendering charts and metric cards
- user interaction with filters and dropdowns
- Excel upload modal behavior
- language switching between French and English

The key files are in:

- frontend/src/App.jsx
- frontend/src/components/
- frontend/src/index.css

### 2.2 Backend layer

The backend is an Express API. It serves the dashboard data and supports the upload flow.

The server loads JSON files from backend/data and exposes them through endpoints. It also parses uploaded .xlsx files and calculates basic summary metrics.

The core backend file is:

- backend/server.js

This layer is responsible for:

- loading reference datasets
- serving KPIs and sales data to the frontend
- handling filters and pagination for transactions
- calculating forecast scenarios
- processing uploaded Excel files

### 2.3 Data model

The app relies on structured data files in backend/data, including:

- summary.json
- monthly.json
- products.json
- customers.json
- governorates.json
- transactions_sample.json

These are used to simulate a real sales database in a lightweight way. The project is meant to be easy to understand and run locally without a full database setup.

## 3. Detailed explanation of each screen

### 3.1 Navbar

The navbar is the top control layer.

It includes:

- business branding: Cimenterie Executive
- app version label
- data engine status
- currency indicator
- upload button
- confetti presentation button
- language toggle

This part gives the dashboard a polished executive-control style and makes it feel like a real management panel.

### 3.2 Sidebar

The sidebar organizes the dashboard into modular sections.

Sections include:

- Overview
- Product catalog
- Customer risk and credit
- AI forecast simulator
- Transaction explorer
- B2B platform
- Upload

The sidebar is critical because it defines the flow of the application: from strategic KPI view to operational detail.

### 3.3 Executive overview

This is the main landing screen.

It includes:

- revenue KPI card
- total volume KPI card
- average order value KPI card
- average price per ton KPI card
- monthly trend chart
- payment mix visualization
- governorate performance view
- top product analysis

This screen answers the question: “How is the business performing?”

### 3.4 Product catalog

This page covers product-level analysis.

It highlights:

- product revenue contribution
- volume delivered by product
- product pricing efficiency
- product market share
- product card detail for each reference

This is useful for pricing strategy, commercial focus, and product portfolio review.

### 3.5 Geographic analytics

This module shows performance by region.

It analyzes:

- revenue by governorate
- volume by governorate
- customer concentration by region
- ranking table of regional performance

This helps managers see where the strongest commercial activity is happening and which regions deserve attention.

### 3.6 Customer risk and CRM

This module reviews customer-level risk and value.

It shows:

- customer names and codes
- sales volume
- revenue contribution
- credit ratio
- high-risk and low-risk segmentation

This is useful for finance and commercial teams because it supports credit decisions and customer segmentation.

### 3.7 AI forecast simulator

This is one of the most important sections for demonstrating business intelligence.

It includes:

- price adjustment slider
- volume-growth slider
- six-month revenue projection
- forecast trend summary
- line chart visualizing predicted values
- client-specific forecast input area

The logic uses historical data and scenario assumptions to project future revenue. It is not a true production ML model, but it behaves like a practical forecasting tool.

### 3.8 Transaction explorer

This section offers raw operational data.

It supports:

- text search
- filter by product
- filter by governorate
- filter by payment type
- pagination
- CSV export

This is where users inspect transactions at a detailed operational level.

### 3.9 Excel upload module

This feature allows the user to upload an .xlsx file and process the content.

The backend reads the workbook, extracts rows, identifies headers, interprets relevant fields, and returns a summary of:

- number of processed records
- total revenue
- total quantity
- top client

This is valuable because it demonstrates how new business information can be loaded into the dashboard without rebuilding the project.

### 3.10 B2B platform panel

This page is a mock B2B commercial management screen.

It includes:

- partner list
- contract status
- commercial score
- partnership activity
- performance metrics

This makes the dashboard feel more complete by including a business-to-business relationship layer.

## 4. Real technical issues that were fixed

### 4.1 Port conflicts

The app originally failed when ports 3000 and 5000 were already occupied by stale processes. This caused the dashboard not to start reliably.

Fixes:

- clear stale port holders before startup
- improve startup scripts to detect conflicts
- ensure the backend handles EADDRINUSE gracefully

### 4.2 Unreliable Windows launch

The original start-local.cmd had quoting problems when launched from PowerShell. This caused the script to fail even though the files existed.

Fixes:

- simplified start-local.cmd script
- added root-level npm launch commands
- used a more stable concurrently-based startup path

### 4.3 Missing defensive logic

Some UI components assumed key data always existed. When the data shape was slightly different, the app could break or behave inconsistently.

Fixes:

- safe fallbacks for missing summary fields
- default values in charts and cards
- more resilient filtering and sort logic

## 5. How to run the project

### Option 1: Root launch

From the root folder:

```bash
npm install
npm run dev
```

### Option 2: Manual launch

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## 6. Recommended improvements for the future

- add authentication
- replace local JSON with a real database
- add automated tests
- add API validation and Swagger docs
- improve forecast engine with more realistic modeling
- move business logic into services and controllers

## 7. Best way to explain the project

This project is essentially a business intelligence dashboard for a cement sales company. It combines numbers, charts, customer risk management, product analysis, and forecasting into a single management tool. The frontend is user-facing and polished, while the backend acts as the data engine and analytical service layer.

It is ideal for a demo, internal business review, or academic project because it demonstrates how a data-driven analytics application can support operational and strategic decisions.
