const { AppError } = require('./errorHandler');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userType)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

const isGuide = (req, res, next) => {
  if (req.user.userType !== 'guide') {
    return next(new AppError('Only guides can perform this action', 403));
  }
  next();
};

const isTourist = (req, res, next) => {
  if (req.user.userType !== 'tourist') {
    return next(new AppError('Only tourists can perform this action', 403));
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

module.exports = {
  restrictTo,
  isGuide,
  isTourist,
  isAdmin
};
