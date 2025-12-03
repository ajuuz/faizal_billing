"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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

const pdfStyles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  titleBox: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "bold",
  },
  headerBorder: {
    borderTop: "1 solid #000",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000",
    padding: 8,
  },
  headerRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  headerLeft: {
    width: "55%",
    borderRight: "1 solid #000",
    paddingRight: 8,
  },
  headerRight: {
    width: "45%",
    paddingLeft: 8,
  },
  companyName: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#000000",
  },
  companyInfo: {
    fontSize: 7.5,
    color: "#000000",
    marginBottom: 1,
    lineHeight: 1.3,
  },
  logoBrand: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  orderHeaderText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#000000",
  },
  orderInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    borderBottom: "0.5 solid #000",
    paddingBottom: 2,
  },
  orderInfoLabel: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#000000",
  },
  orderInfoValue: {
    fontSize: 7.5,
    color: "#000000",
  },
  orderFromBorder: {
    border: "1 solid #000",
    padding: 6,
    marginBottom: 8,
  },
  orderFromTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    marginBottom: 3,
    textTransform: "uppercase",
    color: "#000000",
  },
  orderFromText: {
    fontSize: 7.5,
    marginBottom: 1,
    lineHeight: 1.3,
    color: "#000000",
  },
  table: {
    marginBottom: 8,
    borderTop: "1 solid #000",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #000",
    paddingVertical: 2,
  },
  tableTotalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 7.5,
    color: "#000000",
    paddingHorizontal: 2,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#000000",
    paddingHorizontal: 2,
  },
  colNum: { width: "4%", textAlign: "center" },
  colItemName: { width: "22%", textAlign: "left" },
  colHsn: { width: "11%", textAlign: "center" },
  colSize: { width: "6%", textAlign: "center" },
  colQty: { width: "8%", textAlign: "center" },
  colUnit: { width: "6%", textAlign: "center" },
  colPrice: { width: "11%", textAlign: "right" },
  colGst: { width: "13%", textAlign: "right" },
  colAmount: { width: "19%", textAlign: "right" },
  amountInWords: {
    marginBottom: 8,
    fontSize: 8,
    fontStyle: "italic",
    color: "#000000",
    paddingLeft: 2,
  },
  summaryContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 10,
  },
  summaryLeft: {
    width: "40%",
    border: "1 solid #000",
    padding: 5,
  },
  summaryRight: {
    width: "60%",
    border: "1 solid #000",
    padding: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottom: "0.5 solid #ccc",
  },
  summaryFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 7.5,
    color: "#000000",
  },
  summaryValue: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#000000",
  },
  igstTable: {
    borderTop: "1 solid #000",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
  },
  igstHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
  },
  igstRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #000",
    paddingVertical: 2,
  },
  igstTotalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    backgroundColor: "#f5f5f5",
    paddingVertical: 3,
    fontWeight: "bold",
  },
  igstColHsn: { width: "22%", textAlign: "center" },
  igstColTaxable: { width: "26%", textAlign: "right" },
  igstColRate: { width: "12%", textAlign: "center" },
  igstColAmount: { width: "20%", textAlign: "right" },
  igstColTotal: { width: "20%", textAlign: "right" },
  footerContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
    borderTop: "1 solid #000",
    paddingTop: 10,
  },
  bankDetails: {
    width: "30%",
  },
  bankTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    marginBottom: 3,
    textTransform: "uppercase",
    color: "#000000",
  },
  bankText: {
    fontSize: 6.5,
    marginBottom: 1,
    color: "#000000",
    lineHeight: 1.2,
  },
  termsContainer: {
    width: "40%",
    paddingHorizontal: 8,
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
  },
  termsTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    marginBottom: 3,
    textTransform: "uppercase",
    color: "#000000",
  },
  termsText: {
    fontSize: 7,
    color: "#000000",
    lineHeight: 1.3,
  },
  signatureContainer: {
    width: "30%",
    alignItems: "center",
  },
  signatureTitle: {
    fontSize: 7.5,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    color: "#000000",
  },
  signatureFor: {
    fontSize: 7.5,
    fontWeight: "bold",
    marginTop: 3,
    textAlign: "center",
    color: "#000000",
  },
});

const SaleOrderPDF = ({
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
        {/* Title */}
        <View style={pdfStyles.titleBox}>
          <Text>Sale Order</Text>
        </View>

        {/* Header Section */}
        <View style={pdfStyles.headerBorder}>
          <View style={pdfStyles.headerRow}>
            <View style={pdfStyles.headerLeft}>
              <Text style={pdfStyles.logoBrand}>SHINE UP</Text>
              <Text style={pdfStyles.companyName}>
                {sellerInfo.companyName || "SHINE UPCARE LLP"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                {sellerInfo.address ||
                  "WARD 13, NO:308 PATHUVANA HOUSE PADUVATHIL ROAD"}
              </Text>
              <Text style={pdfStyles.companyInfo}>
                KADUNGALLOOR, PIN CODE-683110
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
            <View style={pdfStyles.headerRight}>
              <Text style={pdfStyles.orderHeaderText}>Sale Order</Text>
              <View style={pdfStyles.orderInfoRow}>
                <Text style={pdfStyles.orderInfoLabel}>Order No.</Text>
                <Text style={pdfStyles.orderInfoValue}>{orderNumber}</Text>
              </View>
              <View style={pdfStyles.orderInfoRow}>
                <Text style={pdfStyles.orderInfoLabel}>Date</Text>
                <Text style={pdfStyles.orderInfoValue}>{orderDate}</Text>
              </View>
              <View style={pdfStyles.orderInfoRow}>
                <Text style={pdfStyles.orderInfoLabel}>Due Date</Text>
                <Text style={pdfStyles.orderInfoValue}>{dueDate}</Text>
              </View>
              <View style={pdfStyles.orderInfoRow}>
                <Text style={pdfStyles.orderInfoLabel}>Place of supply</Text>
                <Text style={pdfStyles.orderInfoValue}>
                  {placeOfSupply || "33-Tamil Nadu"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order From Section */}
        <View style={pdfStyles.orderFromBorder}>
          <Text style={pdfStyles.orderFromTitle}>Order From</Text>
          <Text style={pdfStyles.orderFromText}>
            {buyerInfo.companyName || "SRI JAI AGENCY"}
          </Text>
          <Text style={pdfStyles.orderFromText}>
            {buyerInfo.address ||
              "II V.S.A.COMPLEX, 135 BYE PASS ROAD, PETHANIYAPURAM, MADURAI-625016"}
          </Text>
          <Text style={pdfStyles.orderFromText}>
            Contact No. : {buyerInfo.contact || "9677798025"}
          </Text>
          <Text style={pdfStyles.orderFromText}>
            State: {buyerInfo.state || "33-Tamil Nadu"}
          </Text>
        </View>

        {/* Items Table */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colNum]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colItemName]}>
              Item name
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colHsn]}>
              HSN/ SAC
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colSize]}>
              Size
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colQty]}>
              Quantity
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colUnit]}>
              Unit
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colPrice]}>
              Price/ Unit
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colGst]}>
              GST
            </Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colAmount]}>
              Amount
            </Text>
          </View>

          {selectedProducts.map((product, index) => {
            const productSubtotal = product.price * product.quantity;
            const productGst = (productSubtotal * (product.gst || 0)) / 100;
            const productTotal = productSubtotal + productGst;
            return (
              <View key={product.id} style={pdfStyles.tableRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.colNum]}>
                  {index + 1}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colItemName]}>
                  {product.name}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colHsn]}>
                  {product.hsn || "-"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colSize]}>
                  {product.size || "-"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colQty]}>
                  {product.quantity}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colUnit]}>
                  {product.unit || "-"}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colPrice]}>
                  Rs. {product.price.toFixed(2)}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colGst]}>
                  Rs. {productGst.toFixed(2)} ({product.gst || 0}%)
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.colAmount]}>
                  Rs. {productTotal.toFixed(2)}
                </Text>
              </View>
            );
          })}

          <View style={pdfStyles.tableTotalRow}>
            <Text style={[pdfStyles.tableCell, pdfStyles.colNum]}></Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colItemName]}>
              Total
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colHsn]}></Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colSize]}></Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colQty]}>
              {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)}
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colUnit]}></Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colPrice]}></Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colGst]}>
              Rs. {totalGst.toFixed(2)}
            </Text>
            <Text style={[pdfStyles.tableCell, pdfStyles.colAmount]}>
              Rs. {total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Amount in Words */}
        <Text style={pdfStyles.amountInWords}>
          Order Amount in Words: {amountInWords} Rupees only
        </Text>

        {/* Summary Section */}
        <View style={pdfStyles.summaryContainer}>
          <View style={pdfStyles.summaryLeft}>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Sub Total</Text>
              <Text style={pdfStyles.summaryValue}>Rs. {total.toFixed(2)}</Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Round off</Text>
              <Text style={pdfStyles.summaryValue}>
                Rs. {roundOff.toFixed(2)}
              </Text>
            </View>
            <View style={pdfStyles.summaryFinalRow}>
              <Text style={pdfStyles.summaryLabel}>Total</Text>
              <Text style={pdfStyles.summaryValue}>
                Rs. {finalTotal.toFixed(2)}
              </Text>
            </View>
            <View style={pdfStyles.summaryRow}>
              <Text style={pdfStyles.summaryLabel}>Advance</Text>
              <Text style={pdfStyles.summaryValue}>Rs. 0.00</Text>
            </View>
            <View style={pdfStyles.summaryFinalRow}>
              <Text style={pdfStyles.summaryLabel}>Balance</Text>
              <Text style={pdfStyles.summaryValue}>
                Rs. {finalTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* IGST Table */}
          <View style={pdfStyles.summaryRight}>
            <View style={pdfStyles.igstTable}>
              <View style={pdfStyles.igstHeader}>
                <Text style={[pdfStyles.tableHeaderCell, pdfStyles.igstColHsn]}>
                  HSN/ SAC
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderCell, pdfStyles.igstColTaxable]}
                >
                  Taxable amount
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderCell, pdfStyles.igstColRate]}
                >
                  Rate
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderCell, pdfStyles.igstColAmount]}
                >
                  Amount
                </Text>
                <Text
                  style={[pdfStyles.tableHeaderCell, pdfStyles.igstColTotal]}
                >
                  Total Tax Amount
                </Text>
              </View>

              {igstData.map((item, index) => (
                <View key={index} style={pdfStyles.igstRow}>
                  <Text style={[pdfStyles.tableCell, pdfStyles.igstColHsn]}>
                    {item.hsn}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.igstColTaxable]}>
                    Rs. {item.taxableAmount.toFixed(2)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.igstColRate]}>
                    {item.rate}%
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.igstColAmount]}>
                    Rs. {item.amount.toFixed(2)}
                  </Text>
                  <Text style={[pdfStyles.tableCell, pdfStyles.igstColTotal]}>
                    Rs. {item.amount.toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={pdfStyles.igstTotalRow}>
                <Text style={[pdfStyles.tableCell, pdfStyles.igstColHsn]}>
                  Total
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.igstColTaxable]}>
                  Rs. {totalTaxableAmount.toFixed(2)}
                </Text>
                <Text
                  style={[pdfStyles.tableCell, pdfStyles.igstColRate]}
                ></Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.igstColAmount]}>
                  Rs. {totalTaxAmount.toFixed(2)}
                </Text>
                <Text style={[pdfStyles.tableCell, pdfStyles.igstColTotal]}>
                  Rs. {totalTaxAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footerContainer}>
          <View style={pdfStyles.bankDetails}>
            <Text style={pdfStyles.bankTitle}>Bank Details</Text>
            <Text style={pdfStyles.bankText}>
              Name: {bankDetails?.name || "HDFC BANK, COCHIN - RAVIPURAM"}
            </Text>
            <Text style={pdfStyles.bankText}>
              Account No.: {bankDetails?.accountNo || "50200107201800"}
            </Text>
            <Text style={pdfStyles.bankText}>
              IFSC code: {bankDetails?.ifsc || "HDFC0000020"}
            </Text>
            <Text style={pdfStyles.bankText}>
              Account holder's name:{" "}
              {bankDetails?.accountHolder || "SHINE UPCARE"}
            </Text>
          </View>

          <View style={pdfStyles.termsContainer}>
            <Text style={pdfStyles.termsTitle}>Terms and condition</Text>
            <Text style={pdfStyles.termsText}>
              Thanks for doing business with us!
            </Text>
          </View>

          <View style={pdfStyles.signatureContainer}>
            <Text style={pdfStyles.signatureFor}>
              For : {sellerInfo.companyName || "SHINE UPCARE LLP"}
            </Text>
            <Text style={pdfStyles.signatureTitle}>Authorized Signatory</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export { SaleOrderPDF };
