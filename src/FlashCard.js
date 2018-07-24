import React, { Component } from 'react';
import levenshtein from 'fast-levenshtein';

import './FlashCard.css';

const borders = {
  full: 'green',
  half: 'orange',
  none: 'red',
};

export default class FlashCard extends Component {

  state = {
    guess: '',
    result: -1,
  }

  setGuess = ({ target: { value } })=> this.setState({ guess: value })

  check = ()=> {
    const scores =
      this.props.answers.map( answer =>
        levenshtein.get(this.state.guess, answer) / (answer.length + 1)
      );

    const minResult = Math.min(...scores);
    const result = !minResult ? 'full' :
                   minResult < 0.4 ? 'half' :
                   'none';

    this.setState({ result });
  }
  
  render(){
    const { prompt } = this.props;
    const { guess, result } = this.state;
    
    return (
      <div className='flashcard'>
        <div>
          {prompt}
        </div>
        <div className='prompt'
             style={{ border: '2px solid '+ borders[result] }}>
          <input value={guess} onChange={this.setGuess} />
          <button onClick={this.check}>Check</button>
        </div>
      </div>
    );
  }
};
