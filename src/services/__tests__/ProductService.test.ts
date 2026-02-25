import { ProductService, ProductNotFoundError, ProductAlreadyExistsError } from '../ProductService';
import { IProductRepository } from '../../domain/interfaces/IProductRepository';
import { Product } from '../../domain/entities/Product';

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    // Create mock repository
    mockProductRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
    };

    // Create service with mocked repository
    productService = new ProductService(mockProductRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const validProductData = {
      name: 'Test Product',
      price: 99.99,
      description: 'A test product description',
    };

    it('should successfully create a new product', async () => {
      // Arrange
      const createdProduct: Product = {
        id: '123',
        ...validProductData,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      mockProductRepository.existsByName.mockResolvedValue(false);
      mockProductRepository.create.mockResolvedValue(createdProduct);

      // Act
      const result = await productService.createProduct(validProductData);

      // Assert
      expect(mockProductRepository.existsByName).toHaveBeenCalledWith(validProductData.name);
      expect(mockProductRepository.create).toHaveBeenCalledWith(validProductData);
      expect(result).toEqual({
        id: createdProduct.id,
        name: createdProduct.name,
        price: createdProduct.price,
        description: createdProduct.description,
        createdAt: createdProduct.createdAt,
      });
    });

    it('should throw ProductAlreadyExistsError when product name already exists', async () => {
      // Arrange
      mockProductRepository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(productService.createProduct(validProductData)).rejects.toThrow(
        ProductAlreadyExistsError
      );
      await expect(productService.createProduct(validProductData)).rejects.toThrow(
        `Product with name '${validProductData.name}' already exists`
      );

      expect(mockProductRepository.existsByName).toHaveBeenCalledWith(validProductData.name);
      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      // Arrange
      const repositoryError = new Error('Database error');
      mockProductRepository.existsByName.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(productService.createProduct(validProductData)).rejects.toThrow('Database error');
    });
  });

  describe('getProductById', () => {
    it('should return a product when it exists', async () => {
      // Arrange
      const productId = '123';
      const product: Product = {
        id: productId,
        name: 'Test Product',
        price: 99.99,
        description: 'A test product',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      mockProductRepository.findById.mockResolvedValue(product);

      // Act
      const result = await productService.getProductById(productId);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        createdAt: product.createdAt,
      });
    });

    it('should throw ProductNotFoundError when product does not exist', async () => {
      // Arrange
      const productId = 'non-existent';
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.getProductById(productId)).rejects.toThrow(ProductNotFoundError);
      await expect(productService.getProductById(productId)).rejects.toThrow(
        `Product with id ${productId} not found`
      );

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      // Arrange
      const products: Product[] = [
        {
          id: '1',
          name: 'Product 1',
          price: 10.0,
          description: 'First product',
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
        {
          id: '2',
          name: 'Product 2',
          price: 20.0,
          description: 'Second product',
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
        },
      ];

      mockProductRepository.findAll.mockResolvedValue(products);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(mockProductRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: products[0].id,
        name: products[0].name,
        price: products[0].price,
        description: products[0].description,
        createdAt: products[0].createdAt,
      });
    });

    it('should return an empty array when no products exist', async () => {
      // Arrange
      mockProductRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await productService.getAllProducts();

      // Assert
      expect(result).toEqual([]);
      expect(mockProductRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    const productId = '123';
    const existingProduct: Product = {
      id: productId,
      name: 'Original Product',
      price: 50.0,
      description: 'Original description',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    it('should successfully update a product', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Product',
        price: 75.0,
      };

      const updatedProduct: Product = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date('2026-01-02'),
      };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.existsByName.mockResolvedValue(false);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await productService.updateProduct(productId, updateData);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductRepository.existsByName).toHaveBeenCalledWith(updateData.name);
      expect(mockProductRepository.update).toHaveBeenCalledWith(productId, updateData);
      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
    });

    it('should throw ProductNotFoundError when product does not exist', async () => {
      // Arrange
      const updateData = { price: 100.0 };
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(
        ProductNotFoundError
      );
      await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(
        `Product with id ${productId} not found`
      );

      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ProductAlreadyExistsError when updating name to existing product name', async () => {
      // Arrange
      const updateData = { name: 'Existing Product Name' };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.existsByName.mockResolvedValue(true);

      // Act & Assert
      await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(
        ProductAlreadyExistsError
      );
      await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(
        `Product with name '${updateData.name}' already exists`
      );

      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });

    it('should not check for name existence when name is not being updated', async () => {
      // Arrange
      const updateData = { price: 99.99 };
      const updatedProduct: Product = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date('2026-01-02'),
      };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      // Act
      await productService.updateProduct(productId, updateData);

      // Assert
      expect(mockProductRepository.existsByName).not.toHaveBeenCalled();
    });

    it('should not check for name existence when name remains the same', async () => {
      // Arrange
      const updateData = { name: existingProduct.name, price: 99.99 };
      const updatedProduct: Product = {
        ...existingProduct,
        ...updateData,
        updatedAt: new Date('2026-01-02'),
      };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      // Act
      await productService.updateProduct(productId, updateData);

      // Assert
      expect(mockProductRepository.existsByName).not.toHaveBeenCalled();
    });

    it('should throw ProductNotFoundError when update returns null', async () => {
      // Arrange
      const updateData = { price: 100.0 };

      mockProductRepository.findById.mockResolvedValue(existingProduct);
      mockProductRepository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.updateProduct(productId, updateData)).rejects.toThrow(
        ProductNotFoundError
      );
    });
  });

  describe('deleteProduct', () => {
    const productId = '123';

    it('should successfully delete a product', async () => {
      // Arrange
      const product: Product = {
        id: productId,
        name: 'Test Product',
        price: 50.0,
        description: 'Test description',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(true);

      // Act
      await productService.deleteProduct(productId);

      // Assert
      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should throw ProductNotFoundError when product does not exist', async () => {
      // Arrange
      mockProductRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(productService.deleteProduct(productId)).rejects.toThrow(ProductNotFoundError);
      await expect(productService.deleteProduct(productId)).rejects.toThrow(
        `Product with id ${productId} not found`
      );

      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should call repository delete even if it returns false', async () => {
      // Arrange
      const product: Product = {
        id: productId,
        name: 'Test Product',
        price: 50.0,
        description: 'Test description',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      };

      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(false);

      // Act
      await productService.deleteProduct(productId);

      // Assert
      expect(mockProductRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
