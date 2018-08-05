import React, { Component } from 'react';

class StringListInput extends Component {

  setValue = e=> {
    const id = 1 * e.target.id;

    this.props.onChange(
      this.props.value.map( (item, index)=> index === id ? e.target.value : item )
    );
  }

  addItem = ()=> this.props.onChange( this.props.value.concat('') )

  removeItem = e=> this.props.onChange(
    this.props.value.slice(0, 1 * e.target.id ).concat(
      this.props.value.slice( 1 * e.target.id + 1)
    ) )
  
  render(){
    const { value=[], onChange=(()=>0) } = this.props;
    
    return (
      <div className='StringListInput'>
        <ul>
          {value.map( (item, index)=> (
             <li key={index}>
               <input id={index} value={item} onChange={this.setValue}/>
               <button onClick={this.removeItem} id={index}>X</button>
             </li>
           ) )}
        </ul>
        <button onClick={this.addItem}>+</button>
      </div>
    );
  }
};

export default StringListInput;
