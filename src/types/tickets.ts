export interface Reply {
    id: string;
    message: string;
    createdAt: any;
    createdBy: string;
    isAdminReply: boolean;
}

export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: 'pendiente' | 'en-proceso' | 'resuelto';
    createdAt: string;
    companyId?: string;
    employeeId?: string;
    employeeName?: string;
    departmentId?: string;
    type?: 'company' | 'employee';
    replies?: Reply[];
}
