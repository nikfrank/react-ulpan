import React, { Component } from 'react';
import './CreateExercise.css';

import { readPacks } from './networkCalls';

class CreateExercise extends Component {
  state = {
    pack: '',
    prompt: '',
    answer: [],
    component: 'FlashCard',
    tags: [],

    availablePacks: [],
  }

  componentDidMount(){
    readPacks().then( packs=> this.setState({ availablePacks: Object.keys(packs) }) );
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
