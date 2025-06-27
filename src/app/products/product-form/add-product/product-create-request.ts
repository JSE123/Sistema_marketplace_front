export interface ProductRequest{
    title: string;
    description: string;
    price: number | null;
    stock: number | null;
    status: string;
    categoryId: number;
    location: string;
}