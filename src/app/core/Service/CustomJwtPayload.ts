import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayload extends JwtPayload {
    sub: string;
    authorities: string[];
    id: string;
    exp?: number;
  }