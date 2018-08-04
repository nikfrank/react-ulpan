import React, { Component } from 'react';
import './DoExercise.css';

import Dealer from './Dealer';

import { readExercises, readPacks, createResult } from './networkCalls';

class DoExercise extends Component {

  state = {
    packs: [],
    exercises: [],
  }

  onResult = results =>
    Promise.all( results.map( createResult ) ).then( msgs=> console.log(msgs) )


  componentDidMount(){
    readPacks().then( packs=> this.setState({
      packs: Object.keys(packs).map(pack=> ({ name: pack, size: packs[pack] }) ),
    }) )

    // replace this with query packs onSetCurrentPack
    //readExercises().then( exercises => this.setState({ exercises }) );
  }
  
  render() {
    const { exercises, packs } = this.state;
    
    return (
      <div className='DoExercise'>
        <header className='DoExercise-header'>
          <h1 className='DoExercise-title'>Learn Hebrew!</h1>
        </header>
        <div>
          {!exercises.length ? !packs.length ? null : (
             <ul>
               {packs.map( pack=> (
                  <li key={pack.name}>{pack.name} - {pack.size}</li>
                ) )}
             </ul>
           ) : (
             <Dealer exercises={exercises} onResult={this.onResult}/>
          )}
        </div>
      </div>
    );
  }
}

export default DoExercise;
