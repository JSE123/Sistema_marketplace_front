export interface Product {
    id:          number;
    title:       string;
    description: string;
    user:        User;
    status:      string;
    category:    Category;
    location:    string;
    createdAt:   Date;
    updatedAt:   Date;
    price:     number;
    stock:     number;
    tags:        any[];
    imageUrls:      string[];
}

export interface Category {
    id:   number;
    name: string;
}

export interface User {
    id:                    number;
    username:              string;
    password:              string;
    name:                  null;
    avatar:                null;
    description:           null;
    phone:                 null;
    reputations:           any[];
    accountNoExpired:      boolean;
    accountNoLocked:       boolean;
    credentialNoExpired:   boolean;
    roles:                 Role[];
    enabled:               boolean;
    authorities:           Authority[];
    enable:                boolean;
    accountNonExpired:     boolean;
    credentialsNonExpired: boolean;
    accountNonLocked:      boolean;
}

export interface Authority {
    authority: string;
}

export interface Role {
    id:             number;
    roleEnum:       string;
    permissionList: Category[];
}


export interface images{
    id: number;
    url: string;
}