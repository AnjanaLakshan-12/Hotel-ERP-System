export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  RECEPTIONIST: "RECEPTIONIST",
  SERVICE_STAFF: "SERVICE_STAFF"
};

export const routePermissions = {
  "/admin/dashboard": [
    ROLES.ADMIN
  ],
  "/admin/operations-dashboard": [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.RECEPTIONIST,
  ROLES.SERVICE_STAFF
],
  "/admin/customers": [
    ROLES.ADMIN,
    ROLES.RECEPTIONIST
  ],
  "/admin/rooms": [
    ROLES.ADMIN,
    ROLES.MANAGER
  ],
  "/admin/reservations": [
    ROLES.ADMIN,
    ROLES.RECEPTIONIST
  ],
  "/admin/service-charges": [
    ROLES.ADMIN,
    ROLES.RECEPTIONIST,
    ROLES.SERVICE_STAFF
  ],
  "/admin/billing": [
    ROLES.ADMIN,
    ROLES.RECEPTIONIST
  ],
  "/admin/manager": [
    ROLES.ADMIN,
    ROLES.MANAGER
  ]
};

export const navigationItems = [
  {
  label: "Dashboard",
  path: "/admin/operations-dashboard",
  roles: routePermissions["/admin/operations-dashboard"]
},
{
  label: "Admin Dashboard",
  path: "/admin/dashboard",
  roles: routePermissions["/admin/dashboard"]
},
  {
    label: "Customers",
    path: "/admin/customers",
    roles: routePermissions["/admin/customers"]
  },
  {
    label: "Rooms",
    path: "/admin/rooms",
    roles: routePermissions["/admin/rooms"]
  },
  {
    label: "Reservations",
    path: "/admin/reservations",
    roles: routePermissions["/admin/reservations"]
  },
  {
    label: "Service Charges",
    path: "/admin/service-charges",
    roles: routePermissions["/admin/service-charges"]
  },
  {
    label: "Invoices",
    path: "/admin/billing",
    roles: routePermissions["/admin/billing"]
  },
  {
    label: "Manager Panel",
    path: "/admin/manager",
    roles: routePermissions["/admin/manager"]
  }

];

export const canAccess = (userRole, allowedRoles = []) => {
  return allowedRoles.includes(userRole);
};

export const getDefaultPathForRole = (role) => {
  const item = navigationItems.find((navItem) => canAccess(role, navItem.roles));
  return item ? item.path : "/login";
};