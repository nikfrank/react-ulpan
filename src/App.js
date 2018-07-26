import React, { Component } from 'react';
import './App.css';

import FlashCard from './FlashCard';

const answers = [
  'your mother is a whore',
  'your mother is a hoor',
  'you are a son of a bitch',
  'you\'re a son of a bitch',
];

class App extends Component {

  state = {
    currentPrompt: 'עישון שווה לעבדות',
  }
  
  render() {
    const { currentPrompt } = this.state;
    
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Learn Hebrew!</h1>
        </header>
        <div>
          <FlashCard prompt={currentPrompt} answers={answers}/>
        </div>
      </div>
    );
  }
}

export default App;
