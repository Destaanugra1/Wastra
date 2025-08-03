# Komponen Statistik

Folder ini berisi komponen-komponen untuk dashboard statistik dan laporan.

## Daftar Komponen

### 1. **StatCard.jsx**
Komponen kartu statistik untuk menampilkan metrik utama.
- **Props**: `title`, `value`, `description`, `trend`, `color`
- **Penggunaan**: Menampilkan KPI seperti revenue, orders, dll.

### 2. **ChartCard.jsx**
Komponen wrapper untuk semua chart dengan styling konsisten.
- **Props**: `title`, `subtitle`, `children`
- **Penggunaan**: Wrapper untuk semua komponen chart

### 3. **CustomTooltip.jsx**
Komponen tooltip kustom untuk chart.
- **Props**: `active`, `payload`, `label`, `formatter`
- **Penggunaan**: Tooltip yang konsisten untuk semua chart

### 4. **WeeklyReportChart.jsx**
Chart kombinasi untuk laporan mingguan dengan multi-line dan area chart.
- **Props**: `data`, `title`
- **Fitur**: 
  - Revenue (Area Chart)
  - Orders (Line Chart)
  - Customers (Line Chart dengan dash)
  - Summary cards
  - Tabel performa harian

### 5. **WeeklyInsights.jsx**
Komponen analisis dan insights mingguan.
- **Props**: `data`, `formatCurrency`
- **Fitur**:
  - Metrik performa
  - Analisis tren
  - Best performance day

### 6. **RevenueChart.jsx**
Chart area untuk menampilkan tren revenue.
- **Props**: `data`, `formatCurrency`
- **Tipe**: Area Chart

### 7. **OrdersChart.jsx**
Chart bar untuk menampilkan volume orders harian.
- **Props**: `data`
- **Tipe**: Bar Chart

### 8. **CategoryChart.jsx**
Kombinasi pie chart dan legend untuk analisis kategori.
- **Props**: `categorySales`, `formatCurrency`
- **Fitur**:
  - Pie chart dengan label
  - Legend dengan statistik detail

## Penggunaan

```jsx
import {
  StatCard,
  WeeklyReportChart,
  WeeklyInsights,
  RevenueChart,
  OrdersChart,
  CategoryChart,
} from '../../components/statistik';

// Contoh penggunaan
<StatCard
  title="Total Revenue"
  value={formatCurrency(1000000)}
  description="Weekly earnings"
  trend={{ direction: 'up', value: '12.5' }}
  color="blue"
/>

<WeeklyReportChart 
  data={weeklyData} 
  title="Laporan Mingguan"
/>
```

## Dependencies

- `recharts` - Library untuk chart
- `lucide-react` - Icons
- `react` - React library

## Struktur Data

### Weekly Data Format
```javascript
const weeklyData = [
  {
    date: "2 Agu",
    value: 5000000,    // Revenue
    orders: 45,        // Jumlah order
    customers: 36      // Estimasi customer
  },
  // ... more days
];
```

### Category Sales Format
```javascript
const categorySales = [
  {
    nama_category: "Electronics",
    category_revenue: 2500000,
    total_sales: 150
  },
  // ... more categories
];
```
