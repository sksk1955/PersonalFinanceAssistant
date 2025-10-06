import { Request, Response } from 'express';
import { Category, TransactionType } from '../models/Category';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 GET /api/categories called with query:', req.query);
    
    const { type } = req.query;
    
    const filter: any = {};
    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      filter.type = type;
    }

    console.log('📋 Using filter:', filter);
    const categories = await Category.find(filter).sort({ name: 1 });
    console.log('📋 Found categories from DB:', categories.length);
    
    // Transform the data to ensure consistent structure
    const transformedCategories = categories.map(category => ({
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name,
      type: category.type,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));

    console.log('📋 Returning transformed categories:', transformedCategories.length);
    console.log('📋 Sample categories:', transformedCategories.slice(0, 3));
    res.json(transformedCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, description } = req.body;

    // Validation
    if (!name || !type) {
      res.status(400).json({ error: 'Name and type are required' });
      return;
    }

    if (!Object.values(TransactionType).includes(type)) {
      res.status(400).json({ error: 'Invalid transaction type' });
      return;
    }

    // Check if category exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      res.status(400).json({ error: 'Category already exists' });
      return;
    }

    const category = await Category.create({
      name,
      type,
      description
    });

    const transformedCategory = {
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name,
      type: category.type,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.status(201).json(transformedCategory);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, type, description } = req.body;

    if (type && !Object.values(TransactionType).includes(type)) {
      res.status(400).json({ error: 'Invalid transaction type' });
      return;
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, type, description },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const transformedCategory = {
      id: category._id.toString(),
      _id: category._id.toString(),
      name: category.name,
      type: category.type,
      description: category.description,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    res.json(transformedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
