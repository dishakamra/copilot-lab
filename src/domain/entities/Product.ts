export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  price: number;
  description: string;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
}
