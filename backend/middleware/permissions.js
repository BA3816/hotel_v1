// Permission definitions for different roles
// Only admin role exists - all admins have full access
export const permissions = {
  admin: {
    dashboard: true,
    bookings: true,
    guests: true,
    rooms: true,
    activities: true,
    offers: true,
    payments: true,
    settings: true,
  },
};

// Helper function to check if user has permission for a specific resource
export const hasPermission = (role, resource) => {
  if (!role || !permissions[role]) {
    return false;
  }
  return permissions[role][resource] === true;
};

// Middleware to check permissions for routes
export const checkPermission = (resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    
    if (!hasPermission(userRole, resource)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to access ${resource}. Your role: ${userRole}`
      });
    }

    next();
  };
};

// Get all allowed routes for a role
export const getAllowedRoutes = (role) => {
  if (!role || !permissions[role]) {
    return [];
  }

  const allowedRoutes = [];
  const rolePermissions = permissions[role];

  Object.keys(rolePermissions).forEach(resource => {
    if (rolePermissions[resource]) {
      allowedRoutes.push(resource);
    }
  });

  return allowedRoutes;
};
