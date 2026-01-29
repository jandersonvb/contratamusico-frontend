// APIs centralizadas para facilitar importação
export * from './auth';
export { updateUserApi, uploadAvatar } from './user'; // Exporta apenas updateUserApi e uploadAvatar, pois fetchUserDataFromApi já vem de ./auth
export * from './location';
export * from './instrument';
export * from './genre';
export * from './musician';
export * from './booking';
export * from './payment';
export * from './plan';
export * from './chat';
export * from './favorite';
export * from './portfolio';

