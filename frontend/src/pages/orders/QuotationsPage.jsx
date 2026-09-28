import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ArrowRight,
  Printer,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import orderService from '../../api/orderService.js';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import ConvertQuotationModal from './ConvertQuotationModal.jsx';
import PrintableInvoice from '../../components/ui/PrintableInvoice.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedQuotationForConvert, setSelectedQuotationForConvert] = useState(null);
  const [selectedForPrint, setSelectedForPrint] = useState(null);

  const navigate = useNavigate();

  const loadQuotations = () => {
    const cached = orderService.getCachedQuotations();
    setQuotations(cached);
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  const handleConverted = (newInvoice) => {
    // Mark quotation as CONVERTED in cache
    if (selectedQuotationForConvert) {
      const updated = quotations.map((q) =>
        q._id === selectedQuotationForConvert._id ? { ...q, status: 'CONVERTED' } : q
      );
      orderService.setCachedQuotations(updated);
      setQuotations(updated);
    }
    // Preview the new invoice
    setSelectedForPrint(newInvoice);
  };

  const filtered = quotations.filter((q) => {
    if (!search) return true;
    return (
      (q._id && q._id.includes(search)) ||
      (q.saleType && q.saleType.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const columns = [
    {
      key: '_id',
      header: 'Quotation Ref',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-800">
            QT-{val ? val.slice(-6).toUpperCase() : 'EST'}
          </span>
          <div className="text-[11px] text-slate-400">
            {formatDate(row.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'saleType',
      header: 'Pricing Mode',
      render: (val) => (
        <Badge variant={val === 'WHOLESALE' ? 'purple' : 'neutral'} size="sm">
          {val || 'RETAIL'}
        </Badge>
      ),
    },
    {
      key: 'items',
      header: 'Items Count',
      render: (val) => (
        <span className="font-mono text-slate-700">
          {val?.length || 0} products
        </span>
      ),
    },
    {
      key: 'totalPrice',
      header: 'Quoted Total',
      render: (val) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <Badge variant={val === 'CONVERTED' ? 'success' : 'warning'}>
          {val || 'DRAFT'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => setSelectedForPrint(row)}
            title="Print Quotation"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {row.status !== 'CONVERTED' && (
            <Button
              size="sm"
              variant="primary"
              className="text-xs"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => setSelectedQuotationForConvert(row)}
            >
              Convert to Invoice
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            Customer Quotations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create cost estimates without modifying stock; convert into official invoices with one click.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/pos')}
        >
          Create Quotation in POS
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadQuotations}
          >
            Refresh List
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage="No quotations recorded yet. Open POS terminal and click 'Save as Estimation Quotation' to build one."
      />

      {/* Convert Modal */}
      {selectedQuotationForConvert && (
        <ConvertQuotationModal
          isOpen={!!selectedQuotationForConvert}
          quotation={selectedQuotationForConvert}
          onClose={() => setSelectedQuotationForConvert(null)}
          onConverted={handleConverted}
        />
      )}

      {/* Printable slip */}
      {selectedForPrint && (
        <PrintableInvoice
          isOpen={!!selectedForPrint}
          order={selectedForPrint}
          onClose={() => setSelectedForPrint(null)}
        />
      )}
    </div>
  );
};

export default QuotationsPage;
