import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { CreateProductData, UpdateProductData, ProductResponse } from '../domain/entities/Product';

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with id ${id} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductAlreadyExistsError extends Error {
  constructor(name: string) {
    super(`Product with name '${name}' already exists`);
    this.name = 'ProductAlreadyExistsError';
  }
}

export class ProductService {
  constructor(private productRepository: IProductRepository) {}

  async createProduct(productData: CreateProductData): Promise<ProductResponse> {
    // Check if product with same name already exists
    const exists = await this.productRepository.existsByName(productData.name);
    if (exists) {
      throw new ProductAlreadyExistsError(productData.name);
    }

    // Create product
    const product = await this.productRepository.create(productData);

    // Return product response
    return this.mapToProductResponse(product);
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return this.mapToProductResponse(product);
  }

  async getAllProducts(): Promise<ProductResponse[]> {
    const products = await this.productRepository.findAll();
    return products.map((product) => this.mapToProductResponse(product));
  }

  async updateProduct(id: string, productData: UpdateProductData): Promise<ProductResponse> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new ProductNotFoundError(id);
    }

    // If name is being updated, check for duplicates
    if (productData.name && productData.name !== existingProduct.name) {
      const nameExists = await this.productRepository.existsByName(productData.name);
      if (nameExists) {
        throw new ProductAlreadyExistsError(productData.name);
      }
    }

    // Update product
    const updatedProduct = await this.productRepository.update(id, productData);
    if (!updatedProduct) {
      throw new ProductNotFoundError(id);
    }

    return this.mapToProductResponse(updatedProduct);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    await this.productRepository.delete(id);
  }

  private mapToProductResponse(product: {
    id: string;
    name: string;
    price: number;
    description: string;
    createdAt: Date;
  }): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      createdAt: product.createdAt,
    };
  }
}
