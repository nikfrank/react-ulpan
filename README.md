# ulpan project

make your own lessons

get diagnostics

hebrew language shouldn't be a prison!


---

Agenda:

- architecture review: how will we organize our app for future development
- step0: building and styling a FlashCard Component



### architecture review: how will we organize our app for future development

The first component we're making into a feature is the FlashCard with which our users will test their vast knowledge. Building and styling the component will be easy enough (that's our step0), what we'll discuss in this blurb is how to organize the work our App will do to optimize code reuse and replace-ability.


#### props interface for the FlashCard

We want our FlashCard to be replaceable later with other exercise Components (audio -> text, video -> text, answer a question, .... or just a FlashCard with a different grading function) for other developers to build with the same props interface.

*What does it mean to have the same props interface?*

let's say we have a FlashCard like

./src/FlashCardOne.js
```js
import React, { Component } from 'react';

export default class FlashCardOne extends Component {

  gradeAnswer = ()=> {
    if( this.state.currentAnswer === this.props.answer )
      this.props.onResult({ grade: 100 });

    else this.props.onResult({ grade: 0 });
  }

  setAnswer = event => this.setState({ currentAnswer: event.target.value })

  render(){
    const { question, answer } = this.props;
    const { currentAnswer } = this.state;

    return (
      <div>
        <p>{question}</p>
        <input value={currentAnswer} onChange={this.setAnswer}/>
        <button onClick={this.gradeAnswer}>Done!</button>
      </div>
    );
  }
};
```

this is grading very stringently, but it'll work

What is its props interface?... that's the same as asking "what are all the props we use?"

we use ```this.props.question``` ```this.props.answer``` both of which are strings

and also ```this.props.onResult``` which is a function who accepts an object with a number grade.


Therefore any Component who can use ```question, answer, onResult``` from ```this.props``` in a way that is intuitive to the user will be considered to "uphold the same props interface"

of course, some Component may do more work, such as:
- making an http request and grading the result based on that
- rendering a youtube video for users to listen to and form response
(or anything else you can think of)



This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).