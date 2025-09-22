export type MenuItem = { 
  label: string; 
  icon?: string; 
  to?: string; 
  roles?: string[]; 
  children?: MenuItem[] 
}

export const MENU: MenuItem[] = [
  { label: 'Inicio', icon: 'home', to: '/app/dashboard', roles: ['HomeShow'] },
  { label: 'Requisiciones', icon: 'assignment', to: '/app/requisitions', roles: ['HomeShow'] },
  {
    label: 'Requisiciones', icon: 'assignment',
    roles: ['RequisitionsShow','RequisitionsAdd','RequisitionsEdit','RequisitionsDelete'],
    children: [
      { label: 'Solicitud Material', icon: 'assignment_turned_in', to: '/app/req/material', roles: ['RequisitionsAdd','RequisitionsShow'] },
      { label: 'Salida por Servicio', icon: 'assignment_return', to: '/app/req/service', roles: ['RequisitionsAdd','RequisitionsShow'] },
      { label: 'Autorizaciones', icon: 'verified', to: '/app/req/approvals', roles: ['RequisitionsEdit','RequisitionsDelete'] },
    ]
  },
  { label: 'Almacén', icon: 'warehouse', roles: ['InventoryShow','InventoryAdd','InventoryEdit','InventoryDelete'],
    children: [
      { label: 'Entradas', icon: 'login', to: '/app/whs/entries', roles: ['InventoryAdd'] },
      { label: 'Salidas', icon: 'logout', to: '/app/whs/outputs', roles: ['InventoryEdit'] },
      { label: 'Inventario', icon: 'inventory_2', to: '/app/whs/stock', roles: ['InventoryShow'] },
    ]
  },
  { label: 'Reportes', icon: 'summarize', roles: ['ReportsShow','ReqReportsShow','ReqReportsAdd'],
    children: [
      { label: 'Requisiciones', icon: 'query_stats', to: '/app/reports/req', roles: ['ReqReportsShow'] },
      { label: 'Almacén', icon: 'leaderboard', to: '/app/reports/whs', roles: ['ReportsShow'] },
    ]
  },
]
