import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
} from 'react-router-dom';

import DoExercise from './DoExercise';
import CreateExercise from './CreateExercise';

// replace the div with a NavLayout Component

export default ()=> (
  <Router>
    <div>
      <nav>
        <Link to='/do'>Do</Link>
        <Link to='/create'>Create</Link>
      </nav>

      <div className='page-container'>
        <Switch>
          <Route path='/do' exact component={DoExercise}/>
          <Route path='/create' exact component={CreateExercise}/>
          <Redirect from='/' to='do'/>
        </Switch>
      </div>
    </div>
  </Router>
);
