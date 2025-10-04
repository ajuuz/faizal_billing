"use client";

import jsonProducts from "../../data/products.json";

import Products from "@/components/Products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Checkout from "@/components/Checkout";
import { useEffect, useState } from "react";

const App = () => {
  const [products, setProducts] = useState(jsonProducts);
  useEffect(() => {
    setProducts(jsonProducts);
  }, [jsonProducts]);
  return (
    <div className="w-full flex justify-center mt-10">
      {/* Make the tabs container wider and centered */}
      <Tabs defaultValue="account" className="w-full max-w-7xl">
        <TabsList className="mb-4 bg-gray-100 rounded-md p-1 w-full">
          <TabsTrigger
            value="account"
            className="text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-200"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="text-lg font-semibold px-6 py-2 rounded-md hover:bg-gray-200"
          >
            Checkout
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="account"
          className="text-center text-gray-700 text-lg"
        >
          <Products products={products} setProducts={setProducts} />
        </TabsContent>
        <TabsContent
          value="password"
          className="text-center text-gray-700 text-lg"
        >
          <Checkout allProducts={products} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
