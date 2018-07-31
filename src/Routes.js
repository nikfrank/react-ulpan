import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import DoExercise from './DoExercise';
import CreateExercise from './CreateExercise';

// replace the div with a NavLayout Component

export default ()=> (
  <Router>
    <div style={{ height: '100vh', width: '100vw' }}>
      <Switch>
        <Route path='/do' exact component={DoExercise}/>
        <Route path='/create' exact component={CreateExercise}/>
        <Redirect from='/' to='do'/>
      </Switch>
    </div>
  </Router>
);
