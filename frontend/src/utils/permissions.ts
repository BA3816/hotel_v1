// Frontend permission definitions (matches backend)
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

export type Role = 'admin';
export type Resource = 'dashboard' | 'bookings' | 'guests' | 'rooms' | 'activities' | 'offers' | 'payments' | 'settings';

// Check if user has permission for a specific resource
export const hasPermission = (role: Role | string | null | undefined, resource: Resource): boolean => {
  if (!role || !permissions[role as Role]) {
    return false;
  }
  return permissions[role as Role][resource] === true;
};

// Get all allowed routes for a role
export const getAllowedRoutes = (role: Role | string | null | undefined): Resource[] => {
  if (!role || !permissions[role as Role]) {
    return [];
  }

  const allowedRoutes: Resource[] = [];
  const rolePermissions = permissions[role as Role];

  Object.keys(rolePermissions).forEach((resource) => {
    if (rolePermissions[resource as Resource]) {
      allowedRoutes.push(resource as Resource);
    }
  });

  return allowedRoutes;
};

// Get user role from localStorage
export const getUserRole = (): Role | null => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user.role || null;
  } catch {
    return null;
  }
};
