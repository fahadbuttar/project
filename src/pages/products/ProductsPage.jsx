import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Boxes,
  Search,
  Plus,
  Edit2,
  SlidersHorizontal,
  RefreshCw,
  Tags,
  ShoppingCart,
} from 'lucide-react';
import productService from '../../api/productService.js';
import categoryService from '../../api/categoryService.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Select from '../../components/common/Select.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import Card from '../../components/common/Card.jsx';
import CreateProductModal from './CreateProductModal.jsx';
import CreateCategoryModal from './CreateCategoryModal.jsx';
import EditProductModal from './EditProductModal.jsx';
import StockAdjustModal from './StockAdjustModal.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState(null);

  const { addItem } = useCart();
  const toast = useToast();

  const loadCategories = () => {
    setCategories(categoryService.getCachedCategories());
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const {
    data: productData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['productsList', search, category],
    queryFn: () => productService.searchProducts({ search, category }),
  });

  const products = productData?.products || [];

  const handleAddToCart = (product) => {
    if (product.stockQuantity <= 0) {
      toast.warning('Product is out of stock');
      return;
    }
    addItem(product, 1);
    toast.success(`Added ${product.name} to POS cart`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Product & Brand',
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <div className="text-xs text-slate-500">
            Brand: <span className="font-semibold text-slate-700">{row.brand}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (val) => {
        const catName = typeof val === 'object' ? val?.name : val;
        return <Badge variant="neutral">{catName || 'General'}</Badge>;
      },
    },
    {
      key: 'costPrice',
      header: 'Cost Rate',
      render: (val) => (
        <span className="font-mono text-slate-500 text-xs">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'retailPrice',
      header: 'Retail Rate',
      render: (val, row) => (
        <span className="font-mono font-bold text-slate-900">
          {formatCurrency(val)} <span className="text-[10px] text-slate-400">/{row.unit}</span>
        </span>
      ),
    },
    {
      key: 'wholesalePrice',
      header: 'Wholesale Rate',
      render: (val, row) => (
        <span className="font-mono text-slate-700">
          {val ? formatCurrency(val) : '—'}
        </span>
      ),
    },
    {
      key: 'stockQuantity',
      header: 'In Stock',
      render: (val, row) => {
        const isOut = val <= 0;
        const isLow = val <= row.minStockThreshold;
        return (
          <Badge
            variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
            size="md"
          >
            {val} {row.unit}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (_, row) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            onClick={() => handleAddToCart(row)}
            title="Add to POS Cart"
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedProductForAdjust(row)}
            title="Adjust Stock Quantity"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedProductForEdit(row)}
            title="Edit Prices & Info"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amber-500" />
            Inventory Products
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store catalog, retail & wholesale rate cards, and stock safety margins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            leftIcon={<Tags className="w-4 h-4 text-slate-600" />}
            onClick={() => setShowCreateCategory(true)}
          >
            + Category
          </Button>

          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateProduct(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by product name, brand, wire gauge..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<RefreshCw className="w-4 h-4 text-slate-500" />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Table view */}
      <Table
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products matching your search criteria found. Click 'Add Product' to create one."
      />

      {/* Modals */}
      <CreateProductModal
        isOpen={showCreateProduct}
        onClose={() => setShowCreateProduct(false)}
        onCreated={() => {
          refetch();
          loadCategories();
        }}
      />

      <CreateCategoryModal
        isOpen={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreated={() => {
          loadCategories();
          refetch();
        }}
      />

      {selectedProductForEdit && (
        <EditProductModal
          isOpen={!!selectedProductForEdit}
          product={selectedProductForEdit}
          onClose={() => setSelectedProductForEdit(null)}
          onUpdated={() => refetch()}
        />
      )}

      {selectedProductForAdjust && (
        <StockAdjustModal
          isOpen={!!selectedProductForAdjust}
          product={selectedProductForAdjust}
          onClose={() => setSelectedProductForAdjust(null)}
          onAdjusted={() => refetch()}
        />
      )}
    </div>
  );
};

export default ProductsPage;
