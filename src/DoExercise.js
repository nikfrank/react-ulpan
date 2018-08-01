import React, { Component } from 'react';
import './DoExercise.css';

import Dealer from './Dealer';

import { readExercises, createResult } from './networkCalls';

class DoExercise extends Component {

  state = {
    exercises: [],
  }

  onResult = results =>
    Promise.all( results.map( createResult ) ).then( msgs=> console.log(msgs) )


  componentDidMount(){
    readExercises().then( exercises => this.setState({ exercises }) );
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
