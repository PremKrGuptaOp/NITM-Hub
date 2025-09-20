const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(value => {
      if (!value.endsWith('@nitm.ac.in') && !value.endsWith('@student.nitm.ac.in')) {
        throw new Error('Only NIT Meghalaya email addresses are allowed');
      }
      return true;
    }),
  body('rollNumber')
    .isLength({ min: 8, max: 12 })
    .isAlphanumeric()
    .withMessage('Roll number must be alphanumeric and 8-12 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('course')
    .isIn(['BTech', 'MTech', 'PhD', 'MBA'])
    .withMessage('Invalid course selection'),
  body('branch')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Branch is required'),
  body('year')
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be between 1 and 5'),
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Invalid date of birth format'),
  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender selection')
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),
  body('interests.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each interest must be less than 50 characters')
];

// Notice validation rules
const validateNotice = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('category')
    .isIn(['Academic', 'Exam', 'Event', 'General', 'Placement', 'Hostel', 'Emergency'])
    .withMessage('Invalid category'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Invalid priority')
];

// Club validation rules
const validateClub = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Club name is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  body('category')
    .isIn(['Technical', 'Cultural', 'Sports', 'Social', 'Academic', 'Other'])
    .withMessage('Invalid category'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format')
];

// Event validation rules
const validateEvent = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('eventType')
    .isIn(['Workshop', 'Seminar', 'Competition', 'Cultural', 'Sports', 'Social', 'Academic', 'Other'])
    .withMessage('Invalid event type'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date format'),
  body('venue')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Venue is required')
];

// Message validation rules
const validateMessage = [
  body('receiver')
    .isMongoId()
    .withMessage('Invalid receiver ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters')
];

// Param validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateNotice,
  validateClub,
  validateEvent,
  validateMessage,
  validateObjectId,
  validatePagination
};