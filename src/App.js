import React, { Component } from 'react';
import './App.css';

import FlashCard from './FlashCard';

class App extends Component {

  state = {
    currentPrompt: 'עישון שווה לעבדות',
    currentAnswer: [
      'smoking is slavery',
      'smoking equals slavery',
    ],
  }
  
  render() {
    const { currentPrompt, currentAnswer } = this.state;
    
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Learn Hebrew!</h1>
        </header>
        <div>
          <FlashCard prompt={currentPrompt} answer={currentAnswer}/>
        </div>
      </div>
    );
  }
}

export default App;
