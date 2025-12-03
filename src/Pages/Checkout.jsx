"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, Download, X } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SaleOrderPDF } from "@/components/sale-order-invoice";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const Checkout = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Seller Info
  const [sellerInfo, setSellerInfo] = useState({
    companyName: "SHINE UPCARE LLP",
    address:
      "WARD 13, NO:308 PATHUVANA HOUSE PADUVATHIL ROAD, KADUNGALLOOR, PIN CODE-683110",
    phone: "8848505472, 9995429278",
    email: "info@shineupcare.com",
    gstin: "32AFNFS1659D1ZZ",
    state: "32-Kerala",
  });

  // Buyer Info
  const [buyerInfo, setBuyerInfo] = useState({
    companyName: "SRI JAI AGENCY",
    address:
      "II V.S.A.COMPLEX, 135 BYE PASS ROAD, PETHANIYAPURAM, MADURAI-625016",
    contact: "9677798025",
    state: "33-Tamil Nadu",
  });

  // Bank Details
  const [bankDetails, setBankDetails] = useState({
    name: "HDFC BANK, COCHIN - RAVIPURAM",
    accountNo: "50200107201800",
    ifsc: "HDFC0000020",
    accountHolder: "SHINE UPCARE",
  });

  // Generate order number
  const orderNumber = useMemo(
    () => `SO/2025-${Date.now().toString().slice(-6)}`,
    []
  );

  const orderDate = useMemo(
    () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    []
  );

  const dueDate = useMemo(
    () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    []
  );

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "product"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.hsn?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allProducts]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.trim().length > 0);
  };

  const handleSelectProduct = (product) => {
    const sanitizedProduct = {
      id: product.id,
      name: product.name || "Unknown",
      hsn: product.hsn || "-",
      size: product.size || "-",
      unit: product.unit || "-",
      price: Number(product.price) || 0,
      gst: Number(product.gst) || 0,
      quantity: 1,
    };

    const existing = selectedProducts.find((p) => p.id === sanitizedProduct.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === sanitizedProduct.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, sanitizedProduct]);
    }

    setSearchQuery("");
    setShowDropdown(false);
  };

  const updateQuantity = (id, delta) => {
    setSelectedProducts((prev) =>
      prev
        .map((p) =>
          p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
        )
        .filter((p) => p.quantity > 0)
    );
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const sanitizedProductsForPDF = useMemo(
    () =>
      selectedProducts.map((p) => ({
        id: p.id,
        name: p.name || "Unknown",
        hsn: p.hsn || "-",
        size: p.size || "-",
        unit: p.unit || "-",
        price: Number(p.price) || 0,
        gst: Number(p.gst) || 0,
        quantity: Number(p.quantity) || 0,
      })),
    [selectedProducts]
  );

  // Calculate totals
  const subtotal = useMemo(
    () =>
      sanitizedProductsForPDF.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [sanitizedProductsForPDF]
  );

  const totalGst = useMemo(
    () =>
      sanitizedProductsForPDF.reduce(
        (sum, p) => sum + (p.price * p.quantity * (p.gst || 0)) / 100,
        0
      ),
    [sanitizedProductsForPDF]
  );

  const total = useMemo(() => subtotal + totalGst, [subtotal, totalGst]);

  // Memoize PDF document
  const pdfDocument = useMemo(() => {
    if (sanitizedProductsForPDF.length === 0) {
      return null;
    }
    return (
      <SaleOrderPDF
        selectedProducts={sanitizedProductsForPDF}
        subtotal={subtotal}
        totalGst={totalGst}
        total={total}
        orderNumber={orderNumber}
        orderDate={orderDate}
        dueDate={dueDate}
        placeOfSupply={buyerInfo.state}
        sellerInfo={sellerInfo}
        buyerInfo={buyerInfo}
        bankDetails={bankDetails}
      />
    );
  }, [
    sanitizedProductsForPDF,
    subtotal,
    totalGst,
    total,
    orderNumber,
    orderDate,
    dueDate,
    buyerInfo,
    sellerInfo,
    bankDetails,
  ]);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Sale Order
          </h1>
          <p className="text-muted-foreground">
            Create and manage your sale orders
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products by name or HSN..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-12 text-base"
            />
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-50 ${
                showDropdown && filteredProducts.length > 0
                  ? "max-h-64 opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium text-foreground">
                        {product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        HSN: {product.hsn || "-"} | {product.unit || "-"}
                      </div>
                    </div>
                    <div className="text-foreground font-semibold">
                      Rs. {(Number(product.price) || 0).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Section */}
        {selectedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-end">
              {pdfDocument && (
                <PDFDownloadLink
                  key={selectedProducts.map((p) => p.id).join("-")}
                  document={pdfDocument}
                  fileName={`sale-order-${orderNumber}.pdf`}
                >
                  {({ loading }) => (
                    <Button className="gap-2" disabled={loading}>
                      <Download className="h-4 w-4" />
                      {loading ? "Generating PDF..." : "Download PDF"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>

            {/* Invoice Table */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      #
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Item Name
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      HSN/ SAC
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Size
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Qty
                    </th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Unit
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Price/ Unit
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase">
                      GST
                    </th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase">
                      Amount
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product, index) => {
                    const productSubtotal = product.price * product.quantity;
                    const productGst =
                      (productSubtotal * (product.gst || 0)) / 100;
                    const productTotal = productSubtotal + productGst;
                    return (
                      <tr key={product.id} className="border-b border-border">
                        <td className="py-4 text-center text-foreground">
                          {index + 1}
                        </td>
                        <td className="py-4 text-foreground font-medium">
                          {product.name}
                        </td>
                        <td className="py-4 text-muted-foreground font-mono text-sm text-center">
                          {product.hsn || "-"}
                        </td>
                        <td className="py-4 text-center text-foreground">
                          {product.size || "-"}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="h-7 w-7 rounded border border-border hover:bg-accent flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-medium text-foreground">
                              {product.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="h-7 w-7 rounded border border-border hover:bg-accent flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-center text-foreground">
                          {product.unit || "-"}
                        </td>
                        <td className="py-4 text-right text-foreground">
                          Rs. {product.price.toFixed(2)}
                        </td>
                        <td className="py-4 text-right text-foreground">
                          Rs. {productGst.toFixed(2)} ({product.gst || 0}%)
                        </td>
                        <td className="py-4 text-right text-foreground font-semibold">
                          Rs. {productTotal.toFixed(2)}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="h-7 w-7 rounded hover:bg-destructive/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">
                      Rs. {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total GST</span>
                    <span className="text-foreground font-medium">
                      Rs. {totalGst.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-border">
                    <span className="text-lg font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-foreground">
                      Rs. {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedProducts.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No items added
              </h3>
              <p className="text-muted-foreground">
                Search for products above to add them to your sale order
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
