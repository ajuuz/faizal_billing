import { promises as fs } from "fs";
import path from "path";

const productFilePath = path.join(process.cwd(), "data", "products.json");

// ------------------- CREATE (POST) -------------------
export async function POST(req) {
  try {
    const newProduct = await req.json();
    const data = await fs.readFile(productFilePath, "utf-8");
    const products = JSON.parse(data);

    // Add the new product
    products.push(newProduct);
    await fs.writeFile(productFilePath, JSON.stringify(products, null, 2), "utf-8");

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to add product" }), { status: 500 });
  }
}

// ------------------- UPDATE (PUT) -------------------
export async function PUT(req) {
  try {
    const updatedProduct = await req.json();
    const data = await fs.readFile(productFilePath, "utf-8");
    let products = JSON.parse(data);

    // Find index of product to update
    const index = products.findIndex((p) => p.id === updatedProduct.id);
    if (index === -1) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }

    // Update product
    products[index] = { ...products[index], ...updatedProduct };
    await fs.writeFile(productFilePath, JSON.stringify(products, null, 2), "utf-8");

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to update product" }), { status: 500 });
  }
}

// ------------------- DELETE -------------------
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Product ID is required" }), { status: 400 });
    }

    const data = await fs.readFile(productFilePath, "utf-8");
    let products = JSON.parse(data);

    const filteredProducts = products.filter((p) => p.id !== id);
    if (filteredProducts.length === products.length) {
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
    }

    await fs.writeFile(productFilePath, JSON.stringify(filteredProducts, null, 2), "utf-8");

    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Failed to delete product" }), { status: 500 });
  }
}
