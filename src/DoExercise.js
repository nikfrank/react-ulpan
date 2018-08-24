import React, { Component } from 'react';
import './DoExercise.css';

import Dealer from './Dealer';

import { queryExercises, readPacks, createResult } from './networkCalls';

class DoExercise extends Component {

  state = {
    packs: [],
    exercises: [],
  }

  onResult = results => {
    Promise.all( results.map( createResult ) ).then( msgs=> console.log(msgs) );
    this.setState({ exercises: [] });
  }

  componentDidMount(){
    readPacks().then( packs=> this.setState({
      packs: Object.keys(packs).map(pack=> ({ name: pack, size: packs[pack] }) ),
    }) )
  }

  setPack = (pack)=>
    queryExercises({ pack }).then( exercises => this.setState({ exercises }) )
  
  render() {
    const { exercises, packs } = this.state;
    
    return (
      <div className='DoExercise'>
        <div>
          {!exercises.length ? !packs.length ? null : (
             <ul className='pack-list'>
               {packs.map( pack=> (
                  <li key={pack.name} onClick={()=> this.setPack(pack.name)}>
                    <p>{pack.name} - {pack.size} exercise{pack.size > 1 ? 's':''}</p>
                  </li>
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
