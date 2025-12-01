"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Minus, Download, X } from "lucide-react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer"
import { db } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

// PDF Styles
const pdfStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { marginBottom: 20, paddingBottom: 20, borderBottom: "2 solid #e5e7eb" },
  companyName: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  invoiceTitle: { fontSize: 32, fontWeight: "bold", textAlign: "right" },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  companyInfo: { fontSize: 9, color: "#6b7280", marginBottom: 2 },
  invoiceInfo: { fontSize: 9, color: "#6b7280", textAlign: "right", marginBottom: 2 },
  billTo: { marginTop: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase", marginBottom: 8 },
  table: { marginTop: 20, marginBottom: 20 },
  tableHeader: { flexDirection: "row", borderBottom: "2 solid #e5e7eb", paddingBottom: 8, marginBottom: 8 },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #e5e7eb", paddingVertical: 12 },
  tableColItem: { width: "35%" },
  tableColSku: { width: "20%" },
  tableColQty: { width: "10%", textAlign: "center" },
  tableColPrice: { width: "17.5%", textAlign: "right" },
  tableColAmount: { width: "17.5%", textAlign: "right" },
  tableHeaderText: { fontSize: 9, fontWeight: "bold", color: "#6b7280", textTransform: "uppercase" },
  tableCellText: { fontSize: 10 },
  totalsContainer: { marginTop: 20, alignItems: "flex-end" },
  totalsBox: { width: "40%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottom: "1 solid #e5e7eb" },
  totalRowFinal: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderTop: "2 solid #e5e7eb", marginTop: 8 },
  totalLabel: { fontSize: 10, color: "#6b7280" },
  totalValue: { fontSize: 10, fontWeight: "bold" },
  totalFinalLabel: { fontSize: 12, fontWeight: "bold" },
  totalFinalValue: { fontSize: 16, fontWeight: "bold" },
  footer: { marginTop: 40, paddingTop: 20, borderTop: "1 solid #e5e7eb", textAlign: "center", fontSize: 9, color: "#6b7280" },
})

// PDF Component
const InvoicePDF = ({ selectedProducts, subtotal, tax, total }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <View style={pdfStyles.headerRow}>
          <View>
            <Text style={pdfStyles.companyName}>ACME Solutions</Text>
            <Text style={pdfStyles.companyInfo}>123 Business Street</Text>
            <Text style={pdfStyles.companyInfo}>San Francisco, CA 94102</Text>
            <Text style={pdfStyles.companyInfo}>contact@acmesolutions.com</Text>
            <Text style={pdfStyles.companyInfo}>+1 (555) 123-4567</Text>
          </View>
          <View>
            <Text style={pdfStyles.invoiceTitle}>INVOICE</Text>
            <Text style={pdfStyles.invoiceInfo}>Invoice #: INV-{Date.now().toString().slice(-6)}</Text>
            <Text style={pdfStyles.invoiceInfo}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>
      </View>

      {/* Bill To */}
      <View style={pdfStyles.billTo}>
        <Text style={pdfStyles.sectionTitle}>Bill To</Text>
        <Text style={pdfStyles.tableCellText}>Customer Name</Text>
        <Text style={pdfStyles.companyInfo}>Customer Address</Text>
      </View>

      {/* Items Table */}
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColItem]}>Item</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColSku]}>SKU</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColQty]}>Qty</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColPrice]}>Unit Price</Text>
          <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColAmount]}>Amount</Text>
        </View>
        {selectedProducts.map((product) => (
          <View key={product.id} style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColItem]}>{product.name}</Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColSku]}>{product.sku}</Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColQty]}>{product.quantity}</Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColPrice]}>Rs. {product.price.toFixed(2)}</Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColAmount]}>
              Rs. {(product.price * product.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={pdfStyles.totalsContainer}>
        <View style={pdfStyles.totalsBox}>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Subtotal</Text>
            <Text style={pdfStyles.totalValue}>Rs. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.totalRow}>
            <Text style={pdfStyles.totalLabel}>Tax (10%)</Text>
            <Text style={pdfStyles.totalValue}>Rs. {tax.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.totalRowFinal}>
            <Text style={pdfStyles.totalFinalLabel}>Total</Text>
            <Text style={pdfStyles.totalFinalValue}>Rs. {total.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={pdfStyles.footer}>
        <Text>Thank you for your business! Payment is due within 30 days.</Text>
        <Text style={{ marginTop: 4 }}>For questions, contact us at billing@acmesolutions.com</Text>
      </View>
    </Page>
  </Document>
)

const Checkout = () => {
  const [allProducts, setAllProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])

  const TAX_RATE = 0.1 // 10% tax

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "product"))
        const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setAllProducts(products)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchProducts()
  }, [])

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return []
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, allProducts])

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowDropdown(value.trim().length > 0)
  }

  const handleSelectProduct = (product) => {
    const existing = selectedProducts.find((p) => p.id === product.id)
    if (existing) {
      setSelectedProducts(selectedProducts.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)))
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }])
    }
    setSearchQuery("")
    setShowDropdown(false)
  }

  const updateQuantity = (id, delta) => {
    setSelectedProducts(
      selectedProducts
        .map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    )
  }

  const removeProduct = (id) => setSelectedProducts(selectedProducts.filter((p) => p.id !== id))

  const subtotal = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Create and manage your invoices</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 h-12 text-base"
            />
            <div
              className={`absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out z-50 ${
                showDropdown && filteredProducts.length > 0 ? "max-h-64 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
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
                      <div className="font-medium text-foreground">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sku}</div>
                    </div>
                    <div className="text-foreground font-semibold">Rs. {product.price.toFixed(2)}</div>
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
              <PDFDownloadLink
                document={<InvoicePDF selectedProducts={selectedProducts} subtotal={subtotal} tax={tax} total={total} />}
                fileName={`invoice-${Date.now()}.pdf`}
              >
                {({ loading }) => (
                  <Button className="gap-2" disabled={loading}>
                    <Download className="h-4 w-4" />
                    {loading ? "Generating PDF..." : "Download PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>

            {/* Invoice Table */}
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              {/* Items Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">Item</th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">SKU</th>
                    <th className="text-center py-3 text-sm font-semibold text-muted-foreground uppercase">Qty</th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase">Unit Price</th>
                    <th className="text-right py-3 text-sm font-semibold text-muted-foreground uppercase">Amount</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border">
                      <td className="py-4 text-foreground font-medium">{product.name}</td>
                      <td className="py-4 text-muted-foreground font-mono text-sm">{product.sku}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="h-7 w-7 rounded border border-border hover:bg-accent flex items-center justify-center transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium text-foreground">{product.quantity}</span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="h-7 w-7 rounded border border-border hover:bg-accent flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 text-right text-foreground">Rs. {product.price.toFixed(2)}</td>
                      <td className="py-4 text-right text-foreground font-semibold">
                        Rs. {(product.price * product.quantity).toFixed(2)}
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
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="text-foreground font-medium">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-border">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-foreground">Rs. {total.toFixed(2)}</span>
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
              <h3 className="text-xl font-semibold text-foreground mb-2">No items added</h3>
              <p className="text-muted-foreground">Search for products above to add them to your invoice</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout
