"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  MoreVertical,
  ArrowUpDown,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "@/services/firestore";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hsn: "",
    size: "",
    unit: "",
    price: "",
    gst: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch all products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.hsn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.unit?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return 0;
      });
    }

    return filtered;
  }, [products, searchQuery, sortConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          ...formData,
          price: parseFloat(formData.price) || 0,
          gst: parseFloat(formData.gst) || 0,
        });
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  ...formData,
                  price: parseFloat(formData.price) || 0,
                  gst: parseFloat(formData.gst) || 0,
                }
              : p
          )
        );
      } else {
        const newProduct = {
          ...formData,
          price: parseFloat(formData.price) || 0,
          gst: parseFloat(formData.gst) || 0,
        };
        const docRef = await addProduct(newProduct);
        setProducts((prev) => [...prev, { id: docRef.id, ...newProduct }]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      hsn: "",
      size: "",
      unit: "",
      price: "",
      gst: "",
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      hsn: product.hsn || "",
      size: product.size || "",
      unit: product.unit || "",
      price: product.price?.toString() || "",
      gst: product.gst?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Products</h1>
        <p className="text-muted-foreground">
          Manage your product catalog and pricing
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products, HSN, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Update the product details below."
                    : "Fill in the product details below."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="WAX SHAMPOO R"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="hsn">HSN/ SAC</Label>
                    <Input
                      id="hsn"
                      value={formData.hsn}
                      onChange={(e) =>
                        setFormData({ ...formData, hsn: e.target.value })
                      }
                      placeholder="34059090"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) =>
                        setFormData({ ...formData, size: e.target.value })
                      }
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      placeholder="Kg"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Price/ Unit</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="78.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="gst">GST (%)</Label>
                  <Input
                    id="gst"
                    type="number"
                    step="0.01"
                    value={formData.gst}
                    onChange={(e) =>
                      setFormData({ ...formData, gst: e.target.value })
                    }
                    placeholder="9"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedProducts.length} of {products.length}{" "}
          products
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-center"
                onClick={() => handleSort("name")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  Item Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="text-center"
                onClick={() => handleSort("hsn")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  HSN/ SAC
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="text-center"
                onClick={() => handleSort("size")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  Size
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="text-center"
                onClick={() => handleSort("unit")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  Unit
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="text-center"
                onClick={() => handleSort("price")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  Price/ Unit
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="text-center"
                onClick={() => handleSort("gst")}
              >
                <div className="flex justify-center items-center gap-2 cursor-pointer">
                  GST (%)
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {loading ? "Loading..." : "No products found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-center font-medium">
                    {product.name || "-"}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    {product.hsn || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.size || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.unit || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    Rs. {(product.price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {product.gst || 0}%
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
