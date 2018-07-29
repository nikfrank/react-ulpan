import React, { Component } from 'react';
import './Dealer.css';

import FlashCard from './FlashCard';

class Dealer extends Component {
  state = {
    exercises: this.props.exercises,
    currentExercise: -1,
  }

  start = ()=> this.setState({ currentExercise: 0 })

  next = ()=> this.setState(state => ({ currentExercise: state.currentExercise + 1 }) )
    
  render(){
    const { currentExercise } = this.state;
    
    const cantStart = !this.props.exercises.length;
    const cantNext = currentExercise >= this.props.exercises.length -1;

    const { prompt, answer } = this.props.exercises[ currentExercise ] || {};
    
    return (
      <div>
        {
          currentExercise === -1 ? (
            <button onClick={this.start} disabled={cantStart}>
              Start
            </button>
          ) : (
            <div>
              <FlashCard prompt={prompt} answer={answer} key={currentExercise}/>
              <button onClick={this.next} disabled={cantNext}>Next</button>
            </div>
          )
        }
      </div>
    );
  }
}

export default Dealer;
