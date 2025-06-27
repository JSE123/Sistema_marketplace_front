export interface LoginRequest {
    username: string;
    password: string;
    roleRequest?: RoleRequest;
}

export interface RoleRequest {
    roleListName: string[];
}