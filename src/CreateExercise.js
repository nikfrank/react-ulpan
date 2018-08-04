import React, { Component } from 'react';
import './CreateExercise.css';

class CreateExercise extends Component {
  state = {
    pack: '',
    prompt: '',
    answer: [],
    component: 'FlashCard',
    tags: [],

    availablePacks: [],
  }
  
  render() {
    return (
      <div className='CreateExercise'>
        <input />
      </div>
    );
  }
}

export default CreateExercise;
