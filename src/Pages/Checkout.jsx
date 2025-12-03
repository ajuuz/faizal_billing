"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Minus, Download, X } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

// Helper function to convert number to words
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";
  if (num < 20) return ones[num];
  if (num < 100) {
    return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
  }
  if (num < 1000) {
    return (
      ones[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 ? " " + numberToWords(num % 100) : "")
    );
  }
  if (num < 100000) {
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 ? " " + numberToWords(num % 1000) : "")
    );
  }
  if (num < 10000000) {
    return (
      numberToWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + numberToWords(num % 100000) : "")
    );
  }
  return (
    numberToWords(Math.floor(num / 10000000)) +
    " Crore" +
    (num % 10000000 ? " " + numberToWords(num % 10000000) : "")
  );
};

// PDF Styles matching Sale Order format - Pixel Perfect
const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: "1 solid #000000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  logoSection: {
    width: "65%",
    paddingRight: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#000000",
  },
  companyInfo: {
    fontSize: 8,
    color: "#000000",
    marginBottom: 1.5,
    lineHeight: 1.2,
  },
  orderDetails: {
    width: "32%",
    alignItems: "flex-end",
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000",
  },
  orderInfo: {
    fontSize: 8,
    color: "#000000",
    marginBottom: 1.5,
    textAlign: "right",
    lineHeight: 1.2,
  },
  buyerSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  buyerInfo: {
    fontSize: 9,
    color: "#000000",
    marginBottom: 1.5,
    lineHeight: 1.3,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000000",
    borderTop: "1 solid #000000",
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #e0e0e0",
    paddingVertical: 4,
    minHeight: 20,
  },
  tableColSno: { width: "4%", textAlign: "center", paddingHorizontal: 2 },
  tableColItem: { width: "22%", paddingHorizontal: 3 },
  tableColHsn: { width: "11%", textAlign: "center", paddingHorizontal: 2 },
  tableColSize: { width: "6%", textAlign: "center", paddingHorizontal: 2 },
  tableColQty: { width: "8%", textAlign: "center", paddingHorizontal: 2 },
  tableColUnit: { width: "6%", textAlign: "center", paddingHorizontal: 2 },
  tableColPrice: { width: "11%", textAlign: "right", paddingHorizontal: 3 },
  tableColGst: { width: "13%", textAlign: "right", paddingHorizontal: 3 },
  tableColAmount: { width: "19%", textAlign: "right", paddingHorizontal: 3 },
  tableHeaderText: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#000000",
  },
  tableCellText: {
    fontSize: 8.5,
    color: "#000000",
  },
  tableTotalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000000",
    borderBottom: "1 solid #000000",
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  amountInWords: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 9,
    color: "#000000",
    fontStyle: "italic",
    paddingLeft: 2,
  },
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 12,
    gap: 15,
  },
  summaryLeft: {
    width: "40%",
  },
  summaryRight: {
    width: "55%",
  },
  summaryBox: {
    border: "1 solid #000000",
    padding: 6,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottom: "0.5 solid #e0e0e0",
  },
  summaryRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderTop: "1 solid #000000",
    marginTop: 3,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 8.5,
    color: "#000000",
  },
  summaryValue: {
    fontSize: 8.5,
    color: "#000000",
    fontWeight: "bold",
  },
  igstTable: {
    marginTop: 0,
    marginBottom: 0,
  },
  igstHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000000",
    borderTop: "1 solid #000000",
    paddingVertical: 5,
    backgroundColor: "#f5f5f5",
  },
  igstRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #e0e0e0",
    paddingVertical: 4,
    minHeight: 18,
  },
  igstColHsn: { width: "22%", textAlign: "center", paddingHorizontal: 3 },
  igstColTaxable: { width: "26%", textAlign: "right", paddingHorizontal: 3 },
  igstColRate: { width: "12%", textAlign: "center", paddingHorizontal: 2 },
  igstColAmount: { width: "20%", textAlign: "right", paddingHorizontal: 3 },
  igstColTotal: { width: "20%", textAlign: "right", paddingHorizontal: 3 },
  footer: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bankDetails: {
    width: "28%",
  },
  bankTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  terms: {
    width: "38%",
    paddingHorizontal: 10,
  },
  signature: {
    width: "28%",
    alignItems: "flex-end",
  },
  signatureText: {
    fontSize: 8,
    color: "#000000",
    marginTop: 25,
    textAlign: "right",
  },
});

// PDF Component
const InvoicePDF = ({
  selectedProducts,
  subtotal,
  totalGst,
  total,
  orderNumber,
  orderDate,
  dueDate,
  placeOfSupply,
  sellerInfo,
  buyerInfo,
  bankDetails,
}) => {
  const roundOff = Math.round(total) - total;
  const finalTotal = Math.round(total);
  const amountInWords = numberToWords(Math.floor(finalTotal));

  // Group products by HSN for IGST table
  const grouped = {};
  selectedProducts.forEach((product) => {
    const hsn = product.hsn || "-";
    if (!grouped[hsn]) {
      grouped[hsn] = {
        hsn,
        taxableAmount: 0,
        rate: product.gst || 0,
        amount: 0,
      };
    }
    const productSubtotal = product.price * product.quantity;
    const productGst = (productSubtotal * (product.gst || 0)) / 100;
    grouped[hsn].taxableAmount += productSubtotal;
    grouped[hsn].amount += productGst;
  });
  const igstData = Object.values(grouped);

  const totalTaxableAmount = igstData.reduce(
    (sum, item) => sum + item.taxableAmount,
    0
  );
  const totalTaxAmount = igstData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerRow}>
            <View style={pdfStyles.logoSection}>
              <View style={pdfStyles.logoContainer}>
                <Text style={pdfStyles.logoText}>SHINE UP</Text>
              </View>
              <Text style={pdfStyles.companyName}>
                {sellerInfo.companyName || "SHINE UPCARE LLP"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                {sellerInfo.address ||
                  "WARD 13, NO:308 PATHUVANA HOUSE PADUVATHIL ROAD, KADUNGALLOOR, PIN CODE-683110"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                Phone no.: {sellerInfo.phone || "8848505472, 9995429278"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                Email: {sellerInfo.email || "info@shineupcare.com"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                GSTIN: {sellerInfo.gstin || "32AFNFS1659D1ZZ"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                State: {sellerInfo.state || "32-Kerala"}
              </Text>
            </View>
            <View style={pdfStyles.orderDetails}>
              <Text style={pdfStyles.orderTitle}>Sale Order</Text>
              <Text style={pdfStyles.orderInfo}>Order No.: {orderNumber}</Text>
              <Text style={pdfStyles.orderInfo}>Date: {orderDate}</Text>
              <Text style={pdfStyles.orderInfo}>Due Date: {dueDate}</Text>
              <Text style={pdfStyles.orderInfo}>
                Place of supply: {placeOfSupply || "33-Tamil Nadu"}
              </Text>
            </View>
          </View>
        </View>

        {/* Buyer Section */}
        <View style={pdfStyles.buyerSection}>
          <Text style={pdfStyles.sectionTitle}>Order From</Text>
          <Text style={pdfStyles.buyerInfo}>
            {buyerInfo.companyName || "SRI JAI AGENCY"}
          </Text>
          <Text style={pdfStyles.buyerInfo}>
            {buyerInfo.address ||
              "II V.S.A.COMPLEX, 135 BYE PASS ROAD, PETHANIYAPURAM, MADURAI-625016"}
          </Text>
          <Text style={pdfStyles.buyerInfo}>
            Contact No.: {buyerInfo.contact || "9677798025"}
          </Text>
          <Text style={pdfStyles.buyerInfo}>
            State: {buyerInfo.state || "33-Tamil Nadu"}
          </Text>
        </View>

        {/* Items Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColSno]}>
              #
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColItem]}>
              Item name
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColHsn]}>
              HSN/ SAC
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColSize]}>
              Size
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColQty]}>
              Quantity
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColUnit]}>
              Unit
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColPrice]}>
              Price/ Unit
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColGst]}>
              GST
            </Text>
            <Text style={[pdfStyles.tableHeaderText, pdfStyles.tableColAmount]}>
              Amount
            </Text>
          </View>
          {selectedProducts.map((product, index) => {
            const productSubtotal = product.price * product.quantity;
            const productGst = (productSubtotal * (product.gst || 0)) / 100;
            const productTotal = productSubtotal + productGst;
            return (
              <View key={product.id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColSno]}>
                  {index + 1}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColItem]}>
                  {product.name}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColHsn]}>
                  {product.hsn || "-"}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColSize]}>
                  {product.size || "-"}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColQty]}>
                  {product.quantity}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColUnit]}>
                  {product.unit || "-"}
                </Text>
                <Text
                  style={[pdfStyles.tableCellText, pdfStyles.tableColPrice]}
                >
                  ₹ {product.price.toFixed(2)}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.tableColGst]}>
                  ₹ {productGst.toFixed(2)} ({product.gst || 0}%)
                </Text>
                <Text
                  style={[pdfStyles.tableCellText, pdfStyles.tableColAmount]}
                >
                  ₹ {productTotal.toFixed(2)}
                </Text>
              </View>
            );
          })}
          <View style={pdfStyles.tableTotalRow}>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColSno]}
            ></Text>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColItem]}
            ></Text>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColHsn]}
            ></Text>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColSize]}
            ></Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColQty]}>
              {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}
            </Text>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColUnit]}
            ></Text>
            <Text
              style={[pdfStyles.tableCellText, pdfStyles.tableColPrice]}
            ></Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColGst]}>
              ₹ {totalGst.toFixed(2)}
            </Text>
            <Text style={[pdfStyles.tableCellText, pdfStyles.tableColAmount]}>
              ₹ {total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        <Text style={pdfStyles.amountInWords}>{amountInWords} Rupees only</Text>

        {/* Summary Section */}
        <View style={pdfStyles.summarySection}>
          <View style={pdfStyles.summaryLeft}>
            <View style={pdfStyles.summaryBox}>
              <View style={pdfStyles.summaryRow}>
                <Text style={pdfStyles.summaryLabel}>Sub Total</Text>
                <Text style={pdfStyles.summaryValue}>₹ {total.toFixed(2)}</Text>
              </View>
              <View style={pdfStyles.summaryRow}>
                <Text style={pdfStyles.summaryLabel}>Round off</Text>
                <Text style={pdfStyles.summaryValue}>
                  ₹ {roundOff.toFixed(2)}
                </Text>
              </View>
              <View style={pdfStyles.summaryRowFinal}>
                <Text style={pdfStyles.summaryLabel}>Total</Text>
                <Text style={pdfStyles.summaryValue}>
                  ₹ {finalTotal.toFixed(2)}
                </Text>
              </View>
              <View style={pdfStyles.summaryRow}>
                <Text style={pdfStyles.summaryLabel}>Advance</Text>
                <Text style={pdfStyles.summaryValue}>₹ 0.00</Text>
              </View>
              <View style={pdfStyles.summaryRowFinal}>
                <Text style={pdfStyles.summaryLabel}>Balance</Text>
                <Text style={pdfStyles.summaryValue}>
                  ₹ {finalTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
          <View style={pdfStyles.summaryRight}>
            {/* IGST Table */}
            <View style={pdfStyles.igstTable}>
              <View style={pdfStyles.igstHeader}>
                <Text style={[pdfStyles.tableHeaderText, pdfStyles.igstColHsn]}>
                  HSN/ SAC
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderText, pdfStyles.igstColTaxable]}
                >
                  Taxable amount
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderText, pdfStyles.igstColRate]}
                >
                  Rate
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderText, pdfStyles.igstColAmount]}
                >
                  Amount
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderText, pdfStyles.igstColTotal]}
                >
                  Total Tax Amount
                </Text>
              </View>
              {igstData.map((item, index) => (
                <View key={index} style={pdfStyles.igstRow}>
                  <Text style={[pdfStyles.tableCellText, pdfStyles.igstColHsn]}>
                    {item.hsn}
                  </Text>
                  <Text
                    style={[pdfStyles.tableCellText, pdfStyles.igstColTaxable]}
                  >
                    ₹ {item.taxableAmount.toFixed(2)}
                  </Text>
                  <Text
                    style={[pdfStyles.tableCellText, pdfStyles.igstColRate]}
                  >
                    {item.rate}%
                  </Text>
                  <Text
                    style={[pdfStyles.tableCellText, pdfStyles.igstColAmount]}
                  >
                    ₹ {item.amount.toFixed(2)}
                  </Text>
                  <Text
                    style={[pdfStyles.tableCellText, pdfStyles.igstColTotal]}
                  >
                    ₹ {item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
              <View style={pdfStyles.tableTotalRow}>
                <Text style={[pdfStyles.tableCellText, pdfStyles.igstColHsn]}>
                  Total
                </Text>
                <Text
                  style={[pdfStyles.tableCellText, pdfStyles.igstColTaxable]}
                >
                  ₹ {totalTaxableAmount.toFixed(2)}
                </Text>
                <Text
                  style={[pdfStyles.tableCellText, pdfStyles.igstColRate]}
                ></Text>
                <Text
                  style={[pdfStyles.tableCellText, pdfStyles.igstColAmount]}
                >
                  ₹ {totalTaxAmount.toFixed(2)}
                </Text>
                <Text style={[pdfStyles.tableCellText, pdfStyles.igstColTotal]}>
                  ₹ {totalTaxAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <View style={pdfStyles.bankDetails}>
            <Text style={pdfStyles.bankTitle}>Bank Details</Text>
            <Text style={pdfStyles.companyInfo}>
              Name: {bankDetails.name || "HDFC BANK, COCHIN - RAVIPURAM"}
            </Text>
            <Text style={pdfStyles.companyInfo}>
              Account No.: {bankDetails.accountNo || "50200107201800"}
            </Text>
            <Text style={pdfStyles.companyInfo}>
              IFSC code: {bankDetails.ifsc || "HDFC0000020"}
            </Text>
            <Text style={pdfStyles.companyInfo}>
              Account holder's name:{" "}
              {bankDetails.accountHolder || "SHINE UPCARE"}
            </Text>
          </View>
          <View style={pdfStyles.terms}>
            <Text style={pdfStyles.sectionTitle}>Terms and conditions</Text>
            <Text style={pdfStyles.companyInfo}>
              Thanks for doing business with us!
            </Text>
          </View>
          <View style={pdfStyles.signature}>
            <Text style={pdfStyles.signatureText}>
              For : {sellerInfo.companyName || "SHINE UPCARE LLP"}
            </Text>
            <Text style={pdfStyles.signatureText}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

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
      <InvoicePDF
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
