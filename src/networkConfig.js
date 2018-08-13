export const apiDomain =
  (((window||{}).location||{}).origin||'').indexOf('localhost') > -1 ?
  'http://localhost:4000':
  'https://ulpan-server.herokuapp.com';

export const target = 'server';
