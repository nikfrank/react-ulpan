import React, { Component } from 'react';
import './DoExercise.css';

import Dealer from './Dealer';

const apiDomain = 'http://localhost:4000';

class DoExercise extends Component {

  state = {
    exercises: [],
  }

  onResult = results =>
    results.forEach( result => fetch(apiDomain+'/result', {
      method: 'POST',
      body: JSON.stringify( result ),
      headers:{ 'Content-Type': 'application/json' },
      
    }).then( res => res.json() ).then( msg=> console.log(msg) ))


  componentDidMount(){
    fetch(apiDomain+'/exercise').then(res => res.json())
                                .then( exercises => this.setState({ exercises }) );
  }
  
  render() {
    const { exercises } = this.state;
    
    return (
      <div className='DoExercise'>
        <header className='DoExercise-header'>
          <h1 className='DoExercise-title'>Learn Hebrew!</h1>
        </header>
        <div>
          {!exercises.length ? null : (
             <Dealer exercises={exercises} onResult={this.onResult}/>
          )}
        </div>
      </div>
    );
  }
}

export default DoExercise;
