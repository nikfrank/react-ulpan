import React, { Component } from 'react';
import './Dealer.css';

import FlashCard from './FlashCard';

class Dealer extends Component {
  state = {
    exercises: this.props.exercises,
    currentExercise: -1,
    results: [],
  }

  start = ()=> this.setState({ currentExercise: 0 })

  next = ()=> this.setState(state => ({ currentExercise: state.currentExercise + 1 }) )

  finish = ()=> {
    this.setState({ currentExercise: -1 });
    this.props.onResult( this.state.results );
  }
  
  onResult = (result)=> {
    this.setState(state => ({ results: state.results.concat(result) }));
  }
  
  render(){
    const { currentExercise } = this.state;
    
    const cantStart = !this.props.exercises.length;
    const last = currentExercise >= this.props.exercises.length -1;

    const { prompt, answer } = this.state.exercises[ currentExercise ] || {};
    
    return (
      <div>
        {
          currentExercise === -1 ? (
            <button onClick={this.start} disabled={cantStart}>
              Start
            </button>
          ) : (
            <div>
              <FlashCard prompt={prompt} answer={answer}
                         onResult={this.onResult}
                         key={currentExercise}/>
              {
                last ? (
                  <button onClick={this.finish}>Finish</button>
                ) : (
                  <button onClick={this.next}>Next</button>
                )
              }
            </div>
          )
        }
      </div>
    );
  }
}

export default Dealer;
