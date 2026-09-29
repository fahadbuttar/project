import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  CreditCard,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';
import customerService from '../../api/customerService.js';
import { useCart } from '../../context/CartContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Table from '../../components/common/Table.jsx';
import Card from '../../components/common/Card.jsx';
import Badge from '../../components/common/Badge.jsx';
import CreateCustomerModal from './CreateCustomerModal.jsx';
import { formatCurrency, formatPhone } from '../../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { setSelectedCustomer } = useCart();
  const navigate = useNavigate();

  const loadCustomers = () => {
    setCustomers(customerService.getCachedCustomers());
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateSaleForCustomer = (customer) => {
    setSelectedCustomer(customer);
    navigate('/pos');
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phoneNo && c.phoneNo.includes(query))
    );
  });

  const columns = [
    {
      key: 'name',
      header: 'Customer Details',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          {row.address && (
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{row.address}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'phoneNo',
      header: 'Mobile Contact',
      render: (val) => (
        <span className="font-mono text-slate-700 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {formatPhone(val)}
        </span>
      ),
    },
    {
      key: 'remainingMoney',
      header: 'Credit / Ledger Due',
      render: (val) => {
        const hasDue = val > 0;
        return (
          <span
            className={`font-mono font-bold ${
              hasDue ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(val || 0)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<ShoppingCart className="w-3.5 h-3.5 text-amber-600" />}
          onClick={() => handleCreateSaleForCustomer(row)}
        >
          Create POS Sale
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Customers & Credit Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain customer directories, track outstanding credit balances, and associate sales invoices.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setShowCreateModal(true)}
        >
          Register Customer
        </Button>
      </div>

      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by customer name or 11-digit phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadCustomers}
          >
            Refresh List
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage="No customers found. Click 'Register Customer' to record buyers for credit accounts."
      />

      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadCustomers}
      />
    </div>
  );
};

export default CustomersPage;
