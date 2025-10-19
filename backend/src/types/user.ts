export interface IUser {
	idUsuario: number;
	nome: string;
	email: string;
	senha: string;
	isAdmin: boolean;
}

export interface IUserLoginDTO {
	email: string;
	senha: string;
}

export interface IUserCadDTO extends Omit<IUser, 'idUsuario'> {}

export interface IUserProfileDTO extends Omit<IUser, 'senha'> {}
