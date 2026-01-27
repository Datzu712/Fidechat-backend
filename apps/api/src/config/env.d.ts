export interface IEnvironmentVariables {
	NODE_ENV: 'development' | 'production' | 'test';
	HTTP_PORT: number;
	DATABASE_URL: string;
}
