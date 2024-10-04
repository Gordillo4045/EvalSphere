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
    invitationCode: string;
}

export interface Department {
    id: string;
    name: string;
    companyId: string;
    description?: string | null;
}

export interface Position {
    id: string;
    title: string;
    department: string;
    departmentId: string;
    level: number;
    companyId: string;
    description?: string | null;
}

export interface Employee {
    id: string;
    name: string;
    email: string;
    role: string;
    position: string;
    avatar?: string;
    companyName: string;
    companyEmail?: string;
    departmentId?: string;
    positionId?: string;
    companyId: string;
    uid: string;
}

export interface Relationship {
    companyId: string;
    department: string;
    description: string;
    id: string;
    level: number;
    title: string;
}
