const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Auth middleware checking token...');
    console.log('Request path:', req.path); // Debug log to see which route is being accessed
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({
        success: false,
        message: 'No authorization header found'
      });
    }

    // Extract token (remove 'Bearer ' if present)
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      console.log('No token found in auth header');
      return res.status(401).json({
        success: false,
        message: 'No token found'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
      
      // Check if the route requires admin access
      const isAdminRoute = req.path.includes('/admin/');
      
      if (isAdminRoute && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized as admin'
        });
      }

      // For teacher routes, allow both admin and teacher roles
      if (req.path.includes('/teacher/') && !['admin', 'teacher'].includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

