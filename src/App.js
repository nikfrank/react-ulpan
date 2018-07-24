import React, { Component } from 'react';
import './App.css';

import FlashCard from './FlashCard';

const prompt = 'אמא שלך זונה';
const answers = [
  'your mother is a whore',
  'you are a son of a bitch',
  'you\'re a son of a bitch',
];

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Learn Hebrew you Asshat</h1>
        </header>
        <div>
          <FlashCard prompt={prompt} answers={answers}/>
        </div>
      </div>
    );
  }
}

export default App;
