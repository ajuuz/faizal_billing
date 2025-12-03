import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";

// Add a product with createdAt timestamp
export async function addProduct(product) {
    try {
        const docRef = await addDoc(collection(db, "product"), {
            ...product,
            createdAt: serverTimestamp() // for ordering
        });
        console.log("DOC ID:", docRef.id);
        return docRef;
    } catch (e) {
        console.error("Firestore Error:", e);
    }
}

// Get all products
export async function getProducts() {
    try {
        const q = query(
            collection(db, "product"),
            orderBy("createdAt", "desc") // optional sorting
        );

        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error fetching products:", e);
        return [];
    }
}

// Update a product
export async function updateProduct(id, updatedData) {
    const ref = doc(db, "product", id);
    return await updateDoc(ref, updatedData);
}

// Delete a product
export async function deleteProduct(id) {
    const ref = doc(db, "product", id);
    return await deleteDoc(ref);
}