//eval 360
export interface Company {
    id: string;
    name: string;
    location: string;
    avatar: string;
    description: string | null;
    industry: string;
    email: string;
    password: string;
}

export interface Department {
    id: string;
    name: string;
    companyId: string;
    description: string | null;
}

export interface Position {
    id: string;
    name: string;
    departmentId: string;
    level: number;
    companyId: string;
    description: string | null;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    position: string;
    avatar: string;
    company: string;
    companyEmail: string;
    departmentId: string;
    positionId: string;
    companyId: string;
}

export interface Relationship {
    employeeId: string;
    relationshipType: 'jefe' | 'subordinado' | 'colega';
    relatedEmployeeId: string;
}
