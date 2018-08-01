import { apiDomain, target } from './networkConfig';

import exerciseMock from './networkMocks/exercise';
import resultResponseMock from './networkMocks/resultResponse';

const networkCalls = {
  fake: {
    readExercises: ()=> Promise.resolve( exerciseMock ),
    createResult: ()=> Promise.resolve( resultResponseMock ),
  },

  server: {
    readExercises: ()=> fetch(apiDomain+'/exercise').then(res => res.json()),
    
    createResult: result => fetch(apiDomain+'/result', {
      method: 'POST',
      body: JSON.stringify( result ),
      headers:{ 'Content-Type': 'application/json' },
    }).then( res => res.json() ),
  },
};

export const readExercises = networkCalls[target].readExercises;
export const createResult = networkCalls[target].createResult;
