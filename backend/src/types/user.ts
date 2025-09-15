export interface User {
    idUsuario: number;
    nome: string;
    email: string;
    senha: string;
    isAdmin: boolean;
}

export interface UserLoginDTO {
    email: string;
    senha: string;
}

export interface UserCadDTO extends Omit<User, "idUsuario"> {}

export interface UserProfile extends Omit<User, "senha"> {}