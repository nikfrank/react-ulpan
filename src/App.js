import React, { Component } from 'react';
import './App.css';

import Dealer from './Dealer';

class App extends Component {

  state = {
    exercises: [
      {
        prompt: 'עישון שווה לעבדות',
        answer: [
          'smoking is slavery',
          'smoking equals slavery',
        ],
      },
      {
        prompt: 'מסים לא שונים לגניבה ',
        answer: [
          'taxes are no different than theft',
          'tax is theft',
        ],
      },
      {
        prompt: 'לא אפשר לחנות בתל אביב',
        answer: [
          'you can not park in Tel Aviv',
          'you can\'t park in Tel Aviv',
          'it is impossible to park in Tel Aviv',
          'it\'s impossible to park in Tel Aviv',
          'there\'s no parking in Tel Aviv',
        ],
      },
    ],
  }

  onResult = results => console.log(results)
  
  render() {
    const { exercises } = this.state;
    
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Learn Hebrew!</h1>
        </header>
        <div>
          <Dealer exercises={exercises} onResult={this.onResult}/>
        </div>
      </div>
    );
  }
}

export default App;
