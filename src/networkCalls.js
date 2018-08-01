import { apiDomain } from './networkConfig';

export const readExercises = ()=> fetch(apiDomain+'/exercise').then(res => res.json());

export const createResult =
  result => fetch(apiDomain+'/result', {
    method: 'POST',
    body: JSON.stringify( result ),
    headers:{ 'Content-Type': 'application/json' },
    
  }).then( res => res.json() );
