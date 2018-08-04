import { apiDomain, target } from './networkConfig';

import exerciseMock from './networkMocks/exercise';
import resultResponseMock from './networkMocks/resultResponse';

const packsMock = exerciseMock.reduce( (prev, pack)=> ({
  ...prev, [pack]: (prev[pack]||0)+1
}), {});

const queryExercisesMock = exerciseMock.filter( ({ pack })=> pack === 'cafe' );

const networkCalls = {
  fake: {
    readExercises: ()=> Promise.resolve( exerciseMock ),
    queryExercises: ()=> Promise.resolve( queryExercisesMock ),
    readPacks: ()=> Promise.resolve( packsMock ),
    createResult: ()=> Promise.resolve( resultResponseMock ),
  },

  server: {
    readExercises: ()=> fetch(apiDomain+'/exercise').then(res => res.json()),
    queryExercises: query=> fetch(apiDomain+'/exercise/query', {
      method: 'POST',
      body: JSON.stringify( query ),
      headers:{ 'Content-Type': 'application/json' },
    }).then( res => res.json() ),
    
    readPacks: ()=> fetch(apiDomain+'/exercise/packs').then(res => res.json()),
    
    createResult: result => fetch(apiDomain+'/result', {
      method: 'POST',
      body: JSON.stringify( result ),
      headers:{ 'Content-Type': 'application/json' },
    }).then( res => res.json() ),
  },
};

export const readExercises = networkCalls[target].readExercises;
export const queryExercises = networkCalls[target].queryExercises;
export const readPacks = networkCalls[target].readPacks;
export const createResult = networkCalls[target].createResult;
