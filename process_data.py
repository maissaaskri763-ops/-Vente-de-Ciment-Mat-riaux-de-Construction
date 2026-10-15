#!/usr/bin/env python3
"""
Data Processing Engine for Vente Analytics Dashboard
Reads vente.xlsx and generates optimized JSON datasets
"""

import pandas as pd
from pathlib import Path
from datetime import datetime
import json
from collections import defaultdict

# Configuration
EXCEL_FILE = "vente.xlsx"
OUTPUT_DIR = Path("backend/data")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def round_val(val, decimals=2):
    """Safely round numeric values"""
    try:
        return float(round(float(val), decimals))
    except (ValueError, TypeError):
        return 0.0

def load_data():
    """Load Excel data"""
    print(f"📥 Loading {EXCEL_FILE}...")
    df = pd.read_excel(EXCEL_FILE, sheet_name="oussama")
    df['DAT_LIV'] = pd.to_datetime(df['DAT_LIV'])
    print(f"✅ Loaded {len(df):,} records")
    return df

def generate_summary(df):
    """Generate executive summary KPIs"""
    print("📊 Generating summary statistics...")
    
    summary = {
        "total_records": int(len(df)),
        "total_revenue": round_val(df['MNT_TTC_ART'].sum()),
        "total_qty": round_val(df['QTE_LIV'].sum()),
        "unique_customers": int(df['COD_CLI'].nunique()),
        "unique_products": int(df['ABRV_ART'].nunique()),
        "unique_governorates": int(df['LIB_GOUV'].nunique()),
        "min_date": df['DAT_LIV'].min().strftime('%Y-%m-%d'),
        "max_date": df['DAT_LIV'].max().strftime('%Y-%m-%d'),
        "average_order_value": round_val(df['MNT_TTC_ART'].mean()),
        "average_price_per_ton": round_val(df[df['QTE_LIV'] > 0].apply(
            lambda row: row['MNT_TTC_ART'] / row['QTE_LIV'], axis=1
        ).mean()),
        "average_qty_per_order": round_val(df['QTE_LIV'].mean()),
        "cash_ratio": round_val(
            len(df[df['TYP_REGL'] == 'COMPTANT']) / len(df) * 100
        ),
        "credit_ratio": round_val(
            len(df[df['TYP_REGL'] == 'CREDIT']) / len(df) * 100
        )
    }
    
    return summary

def generate_customers(df):
    """Generate customer analytics with credit risk"""
    print("📋 Generating customer list...")
    
    customer_data = defaultdict(lambda: {
        "revenue": 0,
        "quantity": 0,
        "orders": 0,
        "credit_amount": 0,
        "cash_amount": 0,
        "payment_terms": {}
    })
    
    for _, row in df.iterrows():
        cod_cli = str(row['COD_CLI'])
        nom_cli = row['NOM_CLI']
        mnt = row['MNT_TTC_ART']
        qty = row['QTE_LIV']
        payment = row['TYP_REGL']
        
        if cod_cli not in customer_data:
            customer_data[cod_cli]['name'] = nom_cli
            customer_data[cod_cli]['code'] = cod_cli
        
        customer_data[cod_cli]['revenue'] += mnt
        customer_data[cod_cli]['quantity'] += qty
        customer_data[cod_cli]['orders'] += 1
        
        if payment == 'CREDIT':
            customer_data[cod_cli]['credit_amount'] += mnt
        else:
            customer_data[cod_cli]['cash_amount'] += mnt
        
        customer_data[cod_cli]['payment_terms'][payment] = \
            customer_data[cod_cli]['payment_terms'].get(payment, 0) + 1
    
    # Calculate credit risk score
    customers = []
    for cod, data in customer_data.items():
        total_mnt = data['revenue']
        credit_mnt = data['credit_amount']
        credit_ratio = round_val((credit_mnt / total_mnt * 100) if total_mnt > 0 else 0)
        
        customer = {
            "code": cod,
            "name": data['name'],
            "revenue": round_val(data['revenue']),
            "quantity": round_val(data['quantity']),
            "orders": int(data['orders']),
            "credit_ratio": credit_ratio,
            "cash_ratio": round_val(100 - credit_ratio),
            "avg_order_value": round_val(data['revenue'] / data['orders']),
            "credit_risk": "HIGH" if credit_ratio > 70 else "MEDIUM" if credit_ratio > 30 else "LOW",
            "payment_breakdown": {k: int(v) for k, v in data['payment_terms'].items()}
        }
        customers.append(customer)
    
    # Sort by revenue
    customers = sorted(customers, key=lambda x: x['revenue'], reverse=True)
    return customers

def generate_products(df):
    """Generate product catalog with metrics"""
    print("🏭 Generating product catalog...")
    
    product_data = defaultdict(lambda: {
        "revenue": 0,
        "quantity": 0,
        "orders": 0,
        "min_price": float('inf'),
        "max_price": 0,
        "customers": set()
    })
    
    for _, row in df.iterrows():
        abrv = row['ABRV_ART']
        mnt = row['MNT_TTC_ART']
        qty = row['QTE_LIV']
        cli = str(row['COD_CLI'])
        
        if abrv not in product_data:
            product_data[abrv]['code'] = str(row['COD_ART'])
        
        product_data[abrv]['revenue'] += mnt
        product_data[abrv]['quantity'] += qty
        product_data[abrv]['orders'] += 1
        product_data[abrv]['customers'].add(cli)
        
        if qty > 0:
            price_per_unit = mnt / qty
            product_data[abrv]['min_price'] = min(product_data[abrv]['min_price'], price_per_unit)
            product_data[abrv]['max_price'] = max(product_data[abrv]['max_price'], price_per_unit)
    
    products = []
    for abrv, data in product_data.items():
        price_per_ton = round_val(data['revenue'] / data['quantity']) if data['quantity'] > 0 else 0
        product = {
            "code": data['code'],
            "abbreviation": abrv,
            "name": abrv,
            "revenue": round_val(data['revenue']),
            "quantity": round_val(data['quantity']),
            "orders": int(data['orders']),
            "avg_price_per_ton": price_per_ton,
            "min_price_per_ton": round_val(data['min_price']) if data['min_price'] != float('inf') else 0,
            "max_price_per_ton": round_val(data['max_price']),
            "unique_customers": int(len(data['customers'])),
            "market_share_pct": 0  # Will be calculated after
        }
        products.append(product)
    
    # Sort by revenue
    products = sorted(products, key=lambda x: x['revenue'], reverse=True)
    
    # Calculate market share
    total_revenue = sum(p['revenue'] for p in products)
    for product in products:
        product['market_share_pct'] = round_val(
            (product['revenue'] / total_revenue * 100) if total_revenue > 0 else 0
        )
    
    return products

def generate_governorates(df):
    """Generate geographic analytics"""
    print("🗺️  Generating governorate analytics...")
    
    gouv_data = defaultdict(lambda: {
        "revenue": 0,
        "quantity": 0,
        "orders": 0,
        "customers": set(),
        "products": set()
    })
    
    for _, row in df.iterrows():
        gouv = row['LIB_GOUV']
        mnt = row['MNT_TTC_ART']
        qty = row['QTE_LIV']
        cli = str(row['COD_CLI'])
        prod = row['ABRV_ART']
        
        gouv_data[gouv]['code'] = str(row['COD_GOUV'])
        gouv_data[gouv]['revenue'] += mnt
        gouv_data[gouv]['quantity'] += qty
        gouv_data[gouv]['orders'] += 1
        gouv_data[gouv]['customers'].add(cli)
        gouv_data[gouv]['products'].add(prod)
    
    governorates = []
    for gouv, data in gouv_data.items():
        gov_obj = {
            "code": data['code'],
            "name": gouv,
            "revenue": round_val(data['revenue']),
            "quantity": round_val(data['quantity']),
            "orders": int(data['orders']),
            "unique_customers": int(len(data['customers'])),
            "unique_products": int(len(data['products'])),
            "avg_order_value": round_val(data['revenue'] / data['orders'])
        }
        governorates.append(gov_obj)
    
    # Sort by revenue
    governorates = sorted(governorates, key=lambda x: x['revenue'], reverse=True)
    return governorates

def generate_monthly(df):
    """Generate monthly trend data"""
    print("📈 Generating monthly trends...")
    
    df['YearMonth'] = df['DAT_LIV'].dt.to_period('M')
    
    monthly_data = []
    for period, group in df.groupby('YearMonth'):
        month_str = str(period)
        monthly = {
            "month": month_str,
            "revenue": round_val(group['MNT_TTC_ART'].sum()),
            "quantity": round_val(group['QTE_LIV'].sum()),
            "orders": int(len(group)),
            "unique_customers": int(group['COD_CLI'].nunique()),
            "avg_order_value": round_val(group['MNT_TTC_ART'].mean()),
            "cash_orders": int(len(group[group['TYP_REGL'] == 'COMPTANT'])),
            "credit_orders": int(len(group[group['TYP_REGL'] == 'CREDIT']))
        }
        monthly_data.append(monthly)
    
    # Sort by date
    monthly_data = sorted(monthly_data, key=lambda x: x['month'])
    return monthly_data

def generate_transactions_sample(df, limit=1000):
    """Generate transaction sample for display"""
    print(f"📋 Generating transaction sample (latest {limit})...")
    
    df_sorted = df.sort_values('DAT_LIV', ascending=False)
    sample = df_sorted.head(limit)
    
    transactions = []
    for _, row in sample.iterrows():
        transaction = {
            "num_liv": str(row['NUM_LIV']),
            "date_liv": row['DAT_LIV'].strftime('%Y-%m-%d'),
            "cod_cli": str(row['COD_CLI']),
            "nom_cli": row['NOM_CLI'],
            "qte_liv": round_val(row['QTE_LIV']),
            "cod_art": str(row['COD_ART']),
            "abrv_art": row['ABRV_ART'],
            "lib_gouv": row['LIB_GOUV'],
            "typ_regl": row['TYP_REGL'],
            "mnt_ttc": round_val(row['MNT_TTC_ART'])
        }
        transactions.append(transaction)
    
    return transactions

def save_json(filename, data):
    """Save data to JSON file"""
    filepath = OUTPUT_DIR / filename
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"   ✅ Saved {filepath}")

def main():
    """Main processing pipeline"""
    print("\n" + "="*60)
    print("🚀 VENTE ANALYTICS DATA PROCESSOR")
    print("="*60 + "\n")
    
    # Load data
    df = load_data()
    
    # Generate all datasets
    summary = generate_summary(df)
    customers = generate_customers(df)
    products = generate_products(df)
    governorates = generate_governorates(df)
    monthly = generate_monthly(df)
    transactions = generate_transactions_sample(df, limit=5000)
    
    # Save all files
    print("\n💾 Saving data files...\n")
    save_json("summary.json", summary)
    save_json("customers.json", customers)
    save_json("products.json", products)
    save_json("governorates.json", governorates)
    save_json("monthly.json", monthly)
    save_json("transactions_sample.json", transactions)
    
    print("\n" + "="*60)
    print("✨ Data processing complete!")
    print("="*60)
    print(f"\n📊 Summary Statistics:")
    print(f"   • Total Records: {summary['total_records']:,}")
    print(f"   • Total Revenue: {summary['total_revenue']:,.2f} TND")
    print(f"   • Total Quantity: {summary['total_qty']:,.2f} tons")
    print(f"   • Customers: {summary['unique_customers']}")
    print(f"   • Products: {summary['unique_products']}")
    print(f"   • Governorates: {summary['unique_governorates']}")
    print(f"   • Date Range: {summary['min_date']} → {summary['max_date']}")
    print(f"   • Cash Ratio: {summary['cash_ratio']:.1f}%")
    print(f"   • Credit Ratio: {summary['credit_ratio']:.1f}%")
    print(f"\n✅ All data files ready in {OUTPUT_DIR}\n")

if __name__ == "__main__":
    main()
