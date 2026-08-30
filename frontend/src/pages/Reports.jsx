import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { convertToCSV, downloadCSV } from '/utils/csvExport';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const REPORT_TYPES = ['Shipment Summary', 'Order History', 'Inventory Status Report', 'Dispatch Log'];

function Reports() {
  const [reportType, setReportType] = useState('Shipment Summary');
  const [warehouseId, setWarehouseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [generating, setGenerating] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    api.get('/warehouses', { params: { limit: 100 } }).then((res) => setWarehouses(res.data.warehouses));
  }, []);

  const showWarehouseFilter = reportType !== 'Dispatch Log';
  const showDateFilter = reportType !== 'Inventory Status Report';

  const generateReport = async () => {
    setGenerating(true);
    setRows([]);
    try {
      if (reportType === 'Shipment Summary') {
        const warehouseMap = {};
        warehouses.forEach((w) => { warehouseMap[w._id] = w.name; });
        const res = await api.get('/shipments', {
          params: { warehouseId: warehouseId || undefined, startDate: startDate || undefined, endDate: endDate || undefined, limit: 1000 },
        });
        setColumns([
          { key: 'trackingId', label: 'Tracking ID' },
          { key: 'origin', label: 'Origin Warehouse' },
          { key: 'destination', label: 'Destination' },
          { key: 'status', label: 'Status' },
          { key: 'created', label: 'Created Date' },
        ]);
        setRows(res.data.shipments.map((s) => ({
          trackingId: s.trackingId,
          origin: warehouseMap[s.originWarehouseId] || s.originWarehouseId,
          destination: s.destinationAddress,
          status: s.status,
          created: new Date(s.createdAt).toLocaleDateString(),
        })));
      }

      if (reportType === 'Order History') {
        const [ordersRes, customersRes] = await Promise.all([
          api.get('/orders', { params: { startDate: startDate || undefined, endDate: endDate || undefined, limit: 1000 } }),
          api.get('/customers', { params: { limit: 1000 } }),
        ]);
        const customerMap = {};
        customersRes.data.customers.forEach((c) => { customerMap[c._id] = c.companyName; });
        let orders = ordersRes.data.orders;
        if (warehouseId) orders = orders.filter((o) => o.warehouseId === warehouseId);
        setColumns([
          { key: 'customer', label: 'Customer' },
          { key: 'total', label: 'Total Amount' },
          { key: 'status', label: 'Status' },
          { key: 'created', label: 'Created Date' },
        ]);
        setRows(orders.map((o) => ({
          customer: customerMap[o.customerId] || o.customerId,
          total: o.totalAmount,
          status: o.status,
          created: new Date(o.createdAt).toLocaleDateString(),
        })));
      }

      if (reportType === 'Inventory Status Report') {
        const [invRes, warehouseListRes, productsRes] = await Promise.all([
          api.get('/inventory', { params: { warehouseId: warehouseId || undefined, limit: 1000 } }),
          api.get('/warehouses', { params: { limit: 100 } }),
          api.get('/products', { params: { limit: 1000 } }),
        ]);
        const warehouseMap = {};
        warehouseListRes.data.warehouses.forEach((w) => { warehouseMap[w._id] = w.name; });
        const productMap = {};
        productsRes.data.products.forEach((p) => { productMap[p._id] = p.name; });
        setColumns([
          { key: 'warehouse', label: 'Warehouse' },
          { key: 'product', label: 'Product' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'reorderThreshold', label: 'Reorder Threshold' },
          { key: 'lowStock', label: 'Low Stock' },
        ]);
        setRows(invRes.data.inventory.map((i) => ({
          warehouse: warehouseMap[i.warehouseId] || i.warehouseId,
          product: productMap[i.productId] || i.productId,
          quantity: i.quantity,
          reorderThreshold: i.reorderThreshold,
          lowStock: i.lowStockAlert ? 'Yes' : 'No',
        })));
      }

      if (reportType === 'Dispatch Log') {
        const [dispatchRes, shipmentsRes, vehiclesRes, driversRes] = await Promise.all([
          api.get('/dispatches', { params: { limit: 1000 } }),
          api.get('/shipments', { params: { limit: 1000 } }),
          api.get('/vehicles', { params: { limit: 1000 } }),
          api.get('/drivers', { params: { limit: 1000 } }),
        ]);
        const shipmentMap = {};
        shipmentsRes.data.shipments.forEach((s) => { shipmentMap[s._id] = s.trackingId; });
        const vehicleMap = {};
        vehiclesRes.data.vehicles.forEach((v) => { vehicleMap[v._id] = v.licensePlate; });
        const driverMap = {};
        driversRes.data.drivers.forEach((d) => { driverMap[d._id] = d.name; });
        let dispatches = dispatchRes.data.dispatches;
        if (startDate) dispatches = dispatches.filter((d) => new Date(d.scheduledDate) >= new Date(startDate));
        if (endDate) dispatches = dispatches.filter((d) => new Date(d.scheduledDate) <= new Date(endDate));
        setColumns([
          { key: 'shipment', label: 'Shipment' },
          { key: 'vehicle', label: 'Vehicle' },
          { key: 'driver', label: 'Driver' },
          { key: 'scheduled', label: 'Scheduled Date' },
        ]);
        setRows(dispatches.map((d) => ({
          shipment: shipmentMap[d.shipmentId] || d.shipmentId,
          vehicle: vehicleMap[d.vehicleId] || d.vehicleId,
          driver: driverMap[d.driverId] || d.driverId,
          scheduled: new Date(d.scheduledDate).toLocaleDateString(),
        })));
      }
    } finally {
      setGenerating(false);
    }
  };

  const exportCSV = () => {
    const csv = convertToCSV(rows, columns);
    downloadCSV(csv, `${reportType.replace(/\s+/g, '_')}.csv`);
  };

  const exportPDF = async () => {
    const canvas = await html2canvas(tableRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape' });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${reportType.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Reports & Export</h1>

      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Report Type</label>
          <select value={reportType} onChange={(e) => { setReportType(e.target.value); setRows([]); }} className="border p-2 rounded">
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {showWarehouseFilter && (
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Warehouse</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="border p-2 rounded">
              <option value="">All Warehouses</option>
              {warehouses.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
            </select>
          </div>
        )}

        {showDateFilter && (
          <>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 rounded" />
            </div>
          </>
        )}

        <button disabled={generating} onClick={generateReport} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate Report'}
        </button>

        {rows.length > 0 && (
        <div className="flex gap-3">
            <button onClick={exportCSV} className="bg-gray-800 text-white px-4 py-2 rounded whitespace-nowrap">Export CSV</button>
            <button onClick={exportPDF} className="bg-gray-800 text-white px-4 py-2 rounded whitespace-nowrap">Export PDF</button>
        </div>
        )}
      </div>

      {rows.length > 0 && (
        <div ref={tableRef} className="bg-white rounded-lg shadow overflow-x-auto p-4">
          <h1 className="text-xl font-bold mb-4">LogiFlow</h1>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                {columns.map((c) => <th key={c.key} className="p-3">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  {columns.map((c) => <td key={c.key} className="p-3">{row[c.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length === 0 && !generating && (
        <p className="text-gray-400">Select a report type and click Generate Report.</p>
      )}
    </div>
  );
}
export default Reports;