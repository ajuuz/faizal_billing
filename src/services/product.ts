// -------------------- ADD PRODUCT --------------------
export async function addProduct(newProduct) {
  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if (!res.ok) {
      throw new Error("Failed to add product");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// -------------------- EDIT PRODUCT --------------------
export async function updateProduct(updatedProduct) {
  try {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedProduct),
    });

    if (!res.ok) {
      throw new Error("Failed to update product");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

// -------------------- DELETE PRODUCT --------------------
export async function deleteProduct(id) {
  try {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete product");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

