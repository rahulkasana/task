import API from './api.ts';

export const login = (data: { email: string; password: string }) =>
  API.post('/auth/login', data);

export const signup = (data: { email: string; password: string }) =>
  API.post('/auth/signup', data);

export const fetchMe = () =>
  API.get('/auth/me');
