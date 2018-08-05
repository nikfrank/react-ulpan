import React, { Component } from 'react';
import './CreateExercise.css';

import StringListInput from './StringListInput';

import { readPacks, createExercise } from './networkCalls';

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

  setPack = e=> this.setState({ pack: e.target.value })
  setPrompt = e=> this.setState({ prompt: e.target.value })

  setAnswer = answer=> this.setState({ answer })
  setTags = tags=> this.setState({ tags })

  create = ()=> createExercise({ ...this.state, availablePacks: undefined })
    .then( response => {
      console.log(response);
      this.setState({
        pack: '',
        prompt: '',
        answer: [],
        component: 'FlashCard',
        tags: [],
      });
    });
  
  render() {
    const { pack, prompt, answer, tags, component } = this.state;
    
    return (
      <div className='CreateExercise'>
        <label>Pack <input value={pack} onChange={this.setPack}/></label>
        <label>Prompt <input value={prompt} onChange={this.setPrompt}/></label>
        
        <label>Answer <StringListInput value={answer} onChange={this.setAnswer}/></label>
        <label>Tags <StringListInput value={tags} onChange={this.setTags}/></label>

        <button onClick={this.create}>Create!</button>
      </div>
    );
  }
}

export default CreateExercise;
