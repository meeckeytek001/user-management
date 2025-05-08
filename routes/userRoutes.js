const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/User');

// Helper function to send validation errors
const validate = validations => async (req, res, next) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

// Create
router.post(
  '/',
  validate([
    body('firstName').notEmpty().withMessage('First Name is required'),
    body('lastName').notEmpty().withMessage('Last Name is required'),
    body('ageGroup').isIn(['<18', '18-24', '25-34', '35-44', '45+']).withMessage('Invalid age group'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('hasLaptop').isBoolean().withMessage('Laptop ownership must be true or false'),
    body('bio').isLength({ min: 10 }).withMessage('Bio must be at least 10 characters long'),
    body('heardFrom').isArray({ min: 1 }).withMessage('Select at least one option for how you heard about us'),
  ]),
  async (req, res) => {
    try {
      const user = await User.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get All (no validation needed)
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get One
router.get(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid user ID format'),
  ]),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update
router.put(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('firstName').optional().notEmpty().withMessage('First Name cannot be empty'),
    body('lastName').optional().notEmpty().withMessage('Last Name cannot be empty'),
    body('ageGroup').optional().isIn(['<18', '18-24', '25-34', '35-44', '45+']).withMessage('Invalid age group'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
    body('hasLaptop').optional().isBoolean().withMessage('Laptop ownership must be true or false'),
    body('bio').optional().isLength({ min: 10 }).withMessage('Bio must be at least 10 characters long'),
    body('heardFrom').optional().isArray().withMessage('Heard From must be an array'),
  ]),
  async (req, res) => {
    try {
      const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ error: 'User not found' });
      res.json(updated);
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete
router.delete(
  '/:id',
  validate([
    param('id').isMongoId().withMessage('Invalid user ID format'),
  ]),
  async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'User not found' });
      res.status(204).json({message: "User deleted successfully"});
    } catch {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
