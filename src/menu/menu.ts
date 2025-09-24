export type MenuItem = { 
  label: string; 
  icon?: string; 
  to?: string; 
  roles?: string[]; 
  children?: MenuItem[] 
}

export const MENU: MenuItem[] = [
  { label: 'Inicio', icon: 'famicons:home', to: '/app/dashboard', roles: ['HomeShow'] },
  { label: 'Requisiciones', icon: 'codicon:note', to: '/app/requisitions', roles: ['HomeShow'] },
  {
    label: 'Requisiciones', icon: 'ph:note-fill', roles: ['RequisitionsShow','RequisitionsAdd','RequisitionsEdit','RequisitionsDelete'],
    children: [
      { label: 'Solicitud Material', icon: 'ph:note-fill', to: '/app/req/material', roles: ['RequisitionsAdd','RequisitionsShow'] },
      { label: 'Salida por Servicio', icon: 'ph:note-fill', to: '/app/req/service', roles: ['RequisitionsAdd','RequisitionsShow'] },
      { label: 'Autorizaciones', icon: 'ph:note-fill', to: '/app/req/approvals', roles: ['RequisitionsEdit','RequisitionsDelete'] },
    ]
  },
  { label: 'Almacén', icon: 'ph:note-fill', roles: ['InventoryShow','InventoryAdd','InventoryEdit','InventoryDelete'],
    children: [
      { label: 'Entradas', icon: 'ph:note-fill', to: '/app/whs/entries', roles: ['InventoryAdd'] },
      { label: 'Salidas', icon: 'ph:note-fill', to: '/app/whs/outputs', roles: ['InventoryEdit'] },
      { label: 'Inventario', icon: 'ph:note-fill', to: '/app/whs/stock', roles: ['InventoryShow'] },
    ]
  },
  { label: 'Reportes', icon: 'ph:note-fill', roles: ['ReportsShow','ReqReportsShow','ReqReportsAdd'],
    children: [
      { label: 'Requisiciones', icon: 'ph:note-fill', to: '/app/reports/req', roles: ['ReqReportsShow'] },
      { label: 'Almacén', icon: 'ph:note-fill', to: '/app/reports/whs', roles: ['ReportsShow'] },
    ]
  },
]
