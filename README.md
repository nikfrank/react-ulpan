# ulpan project

make your own lessons

get diagnostics

hebrew language shouldn't be a prison!


---

Agenda:

- Section 0: concepts and introduction
  - architecture review: how will we organize our app for future development
    - replaceable Components (standardizing props interface) ((this needs images))
    - props interface for the FlashCard
    - Application Level Components
  - Server architecture
    - Database schema design
    - API design

- Section 1: front end FlashCard Application
  - step0: building and styling a FlashCard Component
    - using stub data for the FlashCard Component
    - styling the FlashCard
      - linear gradients
      - using a pseudo element to make the red left side line
    - checking the answer
  - step1: rendering repeated exercises from a Dealer Component
    - using stub data for multiple exercises
    - advancing through exercises
    - onResult callbacks and mocking network behaviour
  - step2: build an view level component to load exercises and save results
    - installing react-router into our app, placeholder another view
    - mocking our entire api in a well organized network layer
  - step3: build a view level component to CREATE / EDIT exercises
  - step4: build a view level component to READ && render results

- Section 2: Server for saving exercises and results
  - step0: booting an express server
  - step1: defining API routes and their handlers
    - responding with stub data
  - step2: connecting to postgres (involves installation of postgres)
    - hydrating tables with mock data
    - reading data from the db for GET requests
    - saving data from POST requests
    - updating data with PUT or PATCH requests

- Section 3: user login and identity
  - step0: making a facebook app id
  - step1: integrating facebook login to our app
  - step2: using our facebook identity for CREATE and READ requests
    - on the front end
    - on the server
  - step3: querying exercise groups (lessons) by user
  - step4: full integration of front end and server

- Section 4: deploying a full stack app on heroku with postgres
  - bonus discussion of deployment on AWS / azure cloud runtimes



## Section 0: concepts and introduction

### architecture review: how will we organize our app for future development

#### replaceable Components (standardizing props interface)

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


what we accomplish by publishing documentation of our props api is to standardize the developer experience in adding new Components to our application who do approximately the same job - by making such Components interchangeable programmatically.


to finish the example, we could have a FlashCardTwo, exactly the same as FlashCardOne, but with a different grading function:

./src/FlashCardTwo.js
```js
import React, { Component } from 'react';

export default class FlashCardTwo extends Component {

  gradeAnswer = ()=> {
    if( this.state.currentAnswer.toLowerCase() ===
        this.props.answer.toLowerCase() )
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

this FlashCardTwo will, unlike FlashCardOne, accept answers case-insensitively!

And because it abides the same props interface, it is entirely interchangeable with FlashCardOne, and every other exercise Component a dev will make.


---

#### Application Level Components

In the previous section, we discussed having low level Components which are interchangeable. We discussed them being "programmatically interchangeable" - so if a program is interchanging these Components, what program is that? is it a Component?


Short answer: yes

We will write View level (think pages) or Application level (ie global) Components which do the work of rendering the correct Exercise Component at the right time, and collecting / saving results.

After we have a couple of exercise components to switch between, we'll write one Component to cycle through repeated exercises (ie a Dealer for the Cards) which will be a parent of the various Card (exercise) components)

We will write One Component at the application level which will query the database for exercises, render the Dealer with the exercise (JSON) descriptions, and pass down an onResult handler function which we will use to record user success / failures.


Lastly in this front end application, we will write a View Component for creating and editing exercise prompts, and one for reviewing those result.


---

### Server architecture

#### Database schema design

Our server we will write is node express + sequelizer ORM with postgres

This is a very standard stack, which allows us to write simple Promise based routines to respond to API requests - without writing any SQL.

Our server will store exercises { question, answers, component, tags, author } each a string or strings (author will be a facebook userId) and results (format TBD)


We'll get back to this in Section 2 - Server for saving exercises and results


#### API design

Let's discuss a bit here about what our API will look like

[Create Read Update Delete](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete)

for each of Exercise and Result (our two entity types) - we will want to Create Read Update and Delete them

( though we may decide not to use Delete or Update for Results )

Our main exercise View will Read Exercises with an http request like:

```js
fetch('/exercise', { method: 'GET' })
  .then( response => response.json() )
  .then( exercises => this.setState({ exercises }) )
```

response
```js
[
  {
    question: 'hello',
    answers: [ 'הלו', 'אהלן' ],
    component: 'FlashCard',
    tags: [ 'greetings', 'easy' ],
    author: 'nikFBid',
  },
  //...
]
```

and will create a new one with a request like

```js
const newExercise = {
  question: 'hello',
  answers: [ 'הלו', 'אהלן' ],
  component: 'FlashCard',
  tags: [ 'greetings', 'easy' ],
  author: 'nikFBid',
};

fetch('/exercise', {
  method: 'POST',
  body: JSON.stringify( newExercise ),
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  
}).then( response => response.json() )
  .then( this.onFinishCreatingExercise );
```


The goal is to make our API calls as standard CRUD = RESTful as we can. This will help us use them effectively easily, will help other developers avoid mistakes, and will make documenting them simpler.


---


## Section 1: front end FlashCard Application

To get started, let's make a ```create-react-app``` boilerplate

```
$ cd ~/code
$ create-react-app ulpan
$ cd ulpan
```

and to start the dev-server

```$ npm start```


### step0: building and styling a FlashCard Component

let's start with a boilerplate React Component

```
$ touch ./src/FlashCard.js
$ touch ./src/FlashCard.css
```

./src/FlashCard.js
```js
import React, { Component } from 'react';

import './FlashCard.css';

class FlashCard extends Component {
  state = {}

  render(){
    return (
      <div>Coming Soon...</div>
    );
  }
};

export default FlashCard;
```

./src/App.js
```js
//...
class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Learn Hebrew!</h1>
        </header>
        <div>
          <FlashCard />
        </div>
      </div>
    );
  }
}
//...
```

we're building just a basic FlashCard Component to start.

We've already figured out how it'll fit into the app, so we don't have to worry about that any more (we just have to follow what we decided in Section 0 about the props)


Let's build the basic prompt - answer flow in our FlashCard, assuming we'll get ```this.props.prompt```

./src/FlashCard.js
```js
//...

  state = {
    guess: ''
  }

  setGuess = event=> this.setState({ guess: event.target.value })

  check = ()=> console.log( this.props.prompt, this.state.guess )

  render(){
    const { prompt } = this.props;
    const { guess } = this.state;
    
    return (
      <div className='flashcard'>
        <div>
          {prompt}
        </div>
        <div className='prompt'>
          <input value={guess} onChange={this.setGuess} />
          <button onClick={this.check}>Check</button>
        </div>
      </div>
    );
  }

//...
```

for now, we just have a placeholder for ```this.check``` which we can see the results on the console.

one last thing before we can try this out - we need to pass a ```prompt``` prop from App to FlashCard

#### using stub data for the FlashCard Component

./src/App.js
```js
//...
  state = {
    currentPrompt: 'עישון שווה לעבדות',
  }

//...

  render() {
    const { currentPrompt } = this.state;
    
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Learn Hebrew!</h1>
        </header>
        <div>
          <FlashCard prompt={currentPrompt} />
        </div>
      </div>
    );
  }
//...
```

So we can run this in the browser (on [localhost:3000](http://localhost:3000)

we should see the prompt rendered to the user and when we guess and check, we'll see the prompt and guess logged to the console.


#### styling the FlashCard (to look like a real piece of paper)

I want my FlashCard to look like

<img src='http://res.publicdomainfiles.com/pdf_view/65/13920015614263.png' height=200 width=400/>

So let's learn a bit about linear gradients and pseudo-elements

##### linear gradients

to make the lined background effect we want, the CSS function we'll google is the [linear-gradient](https://www.google.com/search?q=css+linear+gradient)

which we'll use in a [background-image](https://www.w3schools.com/cssref/pr_background-image.asp)

first we'll make a single line

```css
.flashcard {
  background-image:
    linear-gradient( to bottom, rgba(50, 200, 200, 0.5) 1px, transparent 1px);
}
```

next we'll use the [background-size](https://www.w3schools.com/cssref/css3_pr_background-size.asp) to make the background repeat

```css
//...
  background-size: 100px 30px;
```
the first number is the width of the tile to repeat (which doesn't matter here)

the second number is the height (which will be the size of the gap - 1px)


lastly, I want to offset the top line 25px (a bit less than a full gap)

```css
//...
  background-position: 0 25px;
```


to finish up, let's limit the size of the card on the screen and make a border

./src/FlashCard.css
```css
.flashcard {
//...
  min-height: 200px;
  max-width: 80vw;
  margin: 10px auto;

  border: 1px solid rgba( 100, 100, 100, 0.25);
//...
}
```

#### using a pseudo element to make the red left side line

Sometimes when styling an element, we want an extra element to put an icon in or add some color to our element. The CSS feature we'll use is the [::after pseudo element](https://developer.mozilla.org/en-US/docs/Web/CSS/::after)


What we'll use this for here is to make a line for our left margin

first we'll tell CSS to position our pseudo element relative to our .flashcard element

./src/FlashCard.css
```css
.flashcard {
  //...

  position: relative;
}

.flashcard::after {
  content: '';
  position: absolute;
}
```

and now our pseudo element exists and we can style it (in the browser's dev panel `elements`, it's possible to find the ::after element inside of our .flashcard div)

./src/FlashCard.css
```css

.flashcard::after {
  //...
  left: 7%;
  top: 0;
  bottom: 0;
  
  border-left: 2px solid red;
}
```

very nice! now all we have left to to make a function to check the answer!


#### checking the answer

let's fill in a simple function to check equality

./src/FlashCard.js
```js
//...
  state = {
    //...
    result: -1,
  }
  
//...
  check = ()=> {
    const score = ( this.state.guess === this.props.answer ) ? 1 : 0
    this.setState({ result: score });
  }
//...
```

and render out the result

```js
//...
  render(){
    const { prompt } = this.props;
    const { guess, result } = this.state;
    
    return (
      <div className='flashcard'>
        <div>
          {prompt}
        </div>
        <div className='prompt'>
          <input value={guess} onChange={this.setGuess} />
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
```

one last thing - we need to pass the ```answer``` prop in from the app level

./src/App.js
```js
//...
  state = {
    currentPrompt: 'עישון שווה לעבדות',
    currentAnswer: [
      'smoking is slavery',
      'smoking equals slavery',
    ],
  }

//...

  render() {
    const { currentPrompt, currentAnswer } = this.state;


//...
          <FlashCard prompt={currentPrompt} answer={currentAnswer}/>

//...
```



later, we'll program in a callback prop ```onResult``` for our FlashCard so that every time a result occurs, we can move to the next prompt and trigger the correct network behaviour (CREATE result)

for now this will do.



### step1: rendering repeated exercises from a Dealer Component

Our goal in this section is to cycle through a series of prompt-answer pairs each through our ```<FlashCard/>``` Component


#### using stub data for multiple exercises

So far, we have one example to test our Hebrew knowledge with. We'll need a few more for this step already

./src/App.js
```js
//...

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
//...
```

These are important things to know how to say.

Next we'll build a ```<Dealer/>``` Component which can advance through these exercises

The ```<Dealer/>``` will render the ```<FlashCard/>```, so our ```<App/>``` will render the ```<Dealer/>```



#### advancing through exercises

let's make a boilerplate for our Dealer app

```
$ touch ./src/Dealer.js
$ touch ./src/Dealer.css
```

./src/Dealer.js
```js
import React, { Component } from 'react';
import './Dealer.css';

class Dealer extends Component {
  state = {}

  render(){
    return (
      <div>
        Coming Soon...
      </div>
    );
  }
}

export default Dealer;
```


Let's refactor ```App renders FlashCard``` to ```App renders Dealer```


./src/App.js
```js
//...
import React, { Component } from 'react';
import './App.css';

import Dealer from './Dealer';

class App extends Component {
  //...

  render() {
    const { exercises } = this.state;
    
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-title'>Learn Hebrew!</h1>
        </header>
        <div>
          <Dealer exercises={exercises}/>
        </div>
      </div>
    );
  }
```


Now we can build ```<Dealer/>```


./src/Dealer.js
```js
//...

  state = {
    exercises: this.props.exercises,
    currentExercise: -1,
  }

  start = ()=> this.setState({ currentExercise: 0 })

  render(){
    const { currentExercise } = this.state;
    
    return (
      <div>
        {
          currentExercise === -1 ? (
            <button onClick={this.start}>
              Start
            </button>
          ) : 'FLASHCARD PLACEHOLDER' 
        }
      </div>
    );
  }
}

export default Dealer;
```

on init, we save the ```this.props.exercises``` into state, and set the ```.currentExercise``` to -1 (which we'll use to mean we haven't started yet)

We can run this and see that we can advance to the FLASHCARD PLACEHOLDER

now we want to render the FlashCard with the first exercise passed to its props

./src/Dealer.js
```js
//...

import FlashCard from './FlashCard';

//...

  render(){
    const { currentExercise } = this.state;
    const { prompt, answer } = this.state.exercises[ currentExercise ] || {};
    
    return (
      <div>
        {
          currentExercise === -1 ? (
            <button onClick={this.start}>
              Start
            </button>
          ) : (
            <FlashCard prompt={prompt} answer={answer}/>
          )
        }
      </div>
    );
  }
  
//...
```

very good! we haven't changed anything in the ```<FlashCard/>```, so as long as we send in the same props, it'll work just the same


Let's build a ```this.next``` function for the ```<Dealer/>``` to advance to the next exercise

./src/Dealer.js
```js
//...
  next = ()=> this.setState(state => ({ currentExercise: state.currentExercise + 1 }) )

// ... and a button to trigger it

        <button onClick={this.next}>Next</button>
      </div>
    );
  }

```

now if we test our app, the next button advances the ```<FlashCard/>```, but it doesn't clear the input and result. The reason being we've updated the props being passed to the ```<FlashCard/>``` but the FlashCard doesn't clear the results as a results of it

It is possible to solve this two different ways:
- in ./src/FlashCard.js, we can respond to the props update by clearing the state
- in ./src/Dealer.js, we can mount a new ```<FlashCard/>``` using a ```key```

[React's docs on keys](https://reactjs.org/docs/lists-and-keys.html) explain that changing the ```key``` on a rendered Component will tell React to render a new copy of the Component

In this instance my preferred solution is to use the ```key``` to trigger a new mount, as it is simpler, and avoids workaround logic inside ```FlashCard```


./src/Dealer.js
```js
//...
              <FlashCard prompt={prompt} answer={answer}
                         key={currentExercise}/>
//...
```

by setting the ```key``` to ```currentExercise```, every time the next button is clicked, we'll get a new ```<FlashCard/>``` Component with a fresh ```state```.


(In other scenarios where we want to maintain some part of ```state``` inside the child Component, we might use a [componentDidUpdate](https://reactjs.org/docs/react-component.html#componentdidupdate) or [getDerivedStateFromProps](https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops) lifecycle function instead of replacing the whole element by changing its ```key```)


The last thing we'll need to do is collect results from our Components

(( could put an exercise here to animate the transition between prompts ))


####  onResult callbacks and mocking network behaviour

Each time the user hits the check button in the FlashCard, the result of the check should be reported upward (to the parent Component, ie Dealer then App) so that the ```App``` can save the results.

Later in the course, we'll actually send those results to the server to save. For now, we'll pretend to do the network behaviour at the ```App``` level - that way when the server is ready we'll be ready to integrate with the API.


First thing's first: we need to send the result up from ```FlashCard```

./src/FlashCard.js
```js
//...
  check = ()=> {
    const score = ( this.state.guess === this.props.answer ) ? 1 : 0
    this.setState({ result: score });
    this.props.onResult({
      score,
      prompt: this.props.prompt,
      guess: this.state.guess,
    });
  }
  
//...
```

this will break if we run it (```this.props.onResult``` isn't a function until we pass a function in the ```onResult``` prop to ```<FlashCard/>``` from ```<Dealer/>```)

so let's make an onResult function in ```Dealer``` to collect results from the ```<FlashCard/>```s

./src/Dealer.js
```js
//...
  state = {
    //...
    results: [],
  }

  onResult = (result)=>
    this.setState(state => ({ results: state.results.concat(result) }))

//...
              <FlashCard prompt={prompt} answer={answer}
                         onResult={this.onResult}
                         key={currentExercise}/>
//...
```

using ```this.setState```'s [updater function](https://reactjs.org/docs/react-component.html#setstate) to collect our results into an array.


Last thing's last: finishing the exercises and reporting the results


in ```Dealer``` we'll want a "finish" button available at the end of the exercises

where we had *just* a next button before, let's put a next / finish button

./src/Dealer.js
```js
//...
  render(){
    const { currentExercise } = this.state;    
    const last = currentExercise >= this.props.exercises.length -1;

    const { prompt, answer } = this.state.exercises[ currentExercise ] || {};
    
    return (
//...

              {
                last ? (
                  <button onClick={this.finish}>Finish</button>
                ) : (
                  <button onClick={this.next}>Next</button>
                )
              }
//...
```


and a ```this.finish``` function to reset the state and report the results

./src/Dealer.js
```js
//...
  finish = ()=> {
    this.setState({ currentExercise: -1 });
    this.props.onResult( this.state.results );
  }

//...
```

again, running this will throw an error - for the exact same reason!

we are trying to call ```this.props.onResult```, but we haven't passed a function to the ```onResult``` prop on the ```<Dealer/>``` in ./src/App.js


this function we're only calling once the lesson pack (array of exercises) has been completed. Later in the course, we'll use this function to save the result to the server.

./src/App.js
```js
//...

  onResult = results => console.log(results)

//...

          <Dealer exercises={exercises} onResult={this.onResult}/>

//...
```

now we can work our way through the exercises and see our results on the console


---

  - step2: build an view level component to load exercises and save results
    - installing react-router into our app, placeholder another view
    - mocking our entire api in a well organized network layer





This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).