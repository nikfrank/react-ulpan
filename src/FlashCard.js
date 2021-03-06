import React, { Component } from 'react';
import levenshtein from 'fast-levenshtein';

import './FlashCard.css';

class FlashCard extends Component {

  state = {
    guess: '',
    result: -1,
  }

  setGuess = ({ target: { value } })=> this.setState({ guess: value })

  enterCheck = e=> (e.key === 'Enter') && this.check()
  
  check = ()=> {
    const scores =
      this.props.answer.map( answer =>
        levenshtein.get(this.state.guess, answer) / (answer.length + 1)
      );

    const minResult = Math.min(...scores);
    const result = !minResult ? 1 :
                   minResult < 0.4 ? 0.5 :
                   0;

    this.setState({ result });
    this.props.onResult({
      score: result,
      prompt: this.props.prompt,
      guess: this.state.guess,
    });
  }

  render(){
    const { prompt } = this.props;
    const { guess, result } = this.state;
    
    return (
      <div className='flashcard'>
        <div>
          {prompt}
        </div>
        <div className='prompt'>
          <input value={guess} onChange={this.setGuess} autoFocus
                 onKeyPress={this.enterCheck}/>
          <button onClick={this.check}>Check</button>
          {
            result === 1 ? (
              <div>success!</div>
            ) : result > 0 ? (
              <div>almost</div>
            ) : result === 0 ? (
              <div>hmm</div>
            ) : null
          }
        </div>
      </div>
    );
  }
};


export default FlashCard;
