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
  - step2: view level components
    - installing react-router into our app, placeholder another view
  - step3: writing our api in a well organized network layer
    - connecting to a fake api server (reading)
    - connecting to a fake api server (writing)
    - (concept) mocking the network call for offline devving
    - separating our network calls from our component logic
    - toggling between network targets
  - step4: build a view level component to CREATE / EDIT exercises
    - add pack to result CREATE call with server schema update
    - add select by pack feature to DoExercise view
    - build View from server step2 CREATE w pack and tags
  - step5: build a view level component to READ && render results
    - build from server step2 basic charts and basic querying
    - build from server step3 deeper querying
      - add FK -> exercise on result for tags queries
  - step6: upgrade exercise View to edit also
    - build from server step3 EDIT exercise feature
  - step7: many different FlashCards
    - refactor Dealer to resolve from CardLib
    - build another Card (++ feature challenges)

- Section 2: user login and identity
  - step0: making a facebook app id
  - step1: integrating facebook login to our app
  - step2: using our facebook identity for CREATE and READ requests
    - on the front end
    - on the server
  - step3: querying exercise groups (lessons) by user
  - step4: full integration of front end and server

- Section 3: deploying a full stack app on heroku with postgres
  - bonus discussion of deployment on AWS / azure cloud runtimes

- Section 4: testing front end components
  - behaviour testing
  - unit testing
  - network integration testing



---


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

### Server architecture ((move this to ulpan-server))

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


One last thing to say about the Dealer Component:

the only two lines of code in the entire Component which has anything to do with FlashCard are rendering it and importing it; the logic for cycling through exercises and compiling results is independent of the Card. Later in the course, we'll write up other "exercise Card"s in place of FlashCard - we'll still be able to use the Dealer, even if our Cards are of a mixed variety, with only small modifications for choosing the Card Component Class.

---

---


### step2: view level components

In this step we'll use ```react-router``` for the first time to separate View level Components in our app - we'll see it keeping track of the view in our URL with [client side routing](https://medium.com/@wilbo/server-side-vs-client-side-routing-71d710e9227f)


#### installing react-router into our app, placeholder another view

```$ yarn add react-router-dom```

```$ touch ./src/Routes.js```

We're going to declare our routing in ./src/Routes.js as a Component which chooses a View level Component to render - and we'll replace our ReactDOM.render statement in ./src/index.js to render the Routes as the root of our Component tree.


./src/index.js
```js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Routes from './Routes';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Routes />, document.getElementById('root'));
registerServiceWorker();
```

the only change here is that we're replacing ```App``` with ```Routes```

so let's make that Routes Component that we're already trying to render

./src/Routes.js
```js
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';

import DoExercise from './DoExercise';
import CreateExercise from './CreateExercise';

export default ()=> (
  <Router>
    <div style={{ height: '100vh', width: '100vw' }}>
      <Switch>
        <Route path='/do' exact component={DoExercise}/>
        <Route path='/create' exact component={CreateExercise}/>
        <Redirect from='/' to='do'/>
      </Switch>
    </div>
  </Router>
);
```

this will set our default route ('/') to redirect to our DoExercise Component on /do, and set up a placeholder route on /create which we'll use later for making new exercises.

react-router-dom has a good enough [getting started guide](https://reacttraining.com/react-router/web/guides/quick-start), their Components are very intuitive, so readying through their examples should be enough to learn the material.


at this point our build will break, as we are trying to import Components from files which don't exist

so let's fix that!


##### rename ```App``` to ```DoExercise```

```$ mv ./src/App.js ./src/DoExercise.js```
```$ mv ./src/App.css ./src/DoExercise.css```

in ./src/DoExercise.js, find and replace all ```App``` with ```DoExercise```
in ./src/DoExercise.css, find and replace all ```App``` with ```DoExercise```


##### make boilerplate for the ```CreateExercise``` View Component

```
$ touch ./src/CreateExercise.js
$ touch ./src/CreateExercise.css
```

./src/CreateExercise.js
```js
import React, { Component } from 'react';
import './CreateExercise.css';

class CreateExercise extends Component {

  render() {
    return (
      <div className='CreateExercise'>
        Coming Soon...
      </div>
    );
  }
}

export default CreateExercise;
```

./src/CreateExercise.css
```css
.CreateExercise {
  text-align: center;
}
```


at this point our application running in the browser should be back to how it was, teaching the same three exercises over and over and over. We're ready to build out more views for our users to navigate through and accomplish all of their dreams - as soon as we have a network layer.


It is important that we organize the front-end into View Components before we build a network layer, as the View Component will be the Component level which houses the Network Behaviours. This is a design decision which will make it very easy to keep track of our Network Behaviours, as they will exist in a very limited number of places, and act in a consistent manner.


**our** next big step is to organize our View Component (```DoExercise```) to load exercises from a server, and save results thereto - we'll call this "organizing a network layer". Making this connexion is the major step in learning "full-stack web development".


---


### step3: writing our api in a well organized network layer

Currently, our ```exercises``` are hard-coded into the ```state``` initialization of our ```DoExercise``` View Component, and our ```results``` are dumped onto the console, to be forgotten on the next page reload (like castles made of sand).


We will now be programming both of these behaviours to act [asynchronously](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)

through [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) when our server is connected

we will also cover how to mock network behaviour (for offline devving or when the server API endpoints are simply not ready yet)



##### running the server

building the server is in [the ulpan-server companion course](https://github.com/nikfrank/ulpan-server)
- if you're doing that course: work your way through step0: 
- if you aren't: clone the repo and do ```git checkout step1```
  - instructions are provided in ulpan-server's README for syncing up with this course

```
$ cd ~/code/ulpan-server

# roll back the server to the correct point in the version history

$ git checkout step1
$ npm start
```

to run the server locally

----


Our server makes available to us the following API calls:

| path | method | request body | response |
|:---|:---|:---|:---|
| /execise | GET | none | [ { exerciseJSON },.. ] |
| /result | POST | { resultJSON } | successMessage |


so let's get to it: let's load our exercises from the server


#### connecting to a fake api server (reading)

in [workbook 4v2](https://github.com/nikfrank/react-course-workbook-4-v2), we covered GET requests in event handlers / lifecycle functions... eg:

```js
//...

class Widget extends Component {
  state = { items: [] }
  loadInit = ()=> fetch('/items').then(res => res.json())
                                 .then( items=> this.setState({ items }) )

  componentDidMount(){
    this.loadInit();
  }

  render(){
    const { items } = this.state;

    return (
      <ul>
        {items.map(item=> (
          <li key={item.id}>{item.displayName}</li>
        ) )}
      </ul>
    );
  }
}
//...
```

the pattern we use here will be the same:

./src/DoExercise.js
```js
//...
import Dealer from './Dealer';

const apiDomain = 'http://localhost:4000';

class DoExercise extends Component {

  state = {
    exercises: [],
  }

  componentDidMount(){
    fetch(apiDomain+'/exercise').then(res => res.json())
                                .then( exercises => this.setState({ exercises }) );
  }

//...

        <div>
          {!exercises.length ? null : (
             <Dealer exercises={exercises} onResult={this.onResult}/>
          )}
        </div>

//...
```

##### why is apiDomain a const?

from time to time in development and production, our api domain will change

eg. we may have a special api server set up for [testing](https://www.google.com/search?q=testing+environment) / [staging](https://www.google.com/search?q=staging+server) / [local development](https://www.google.com/search?q=developing+node+server+locally) / [production](https://www.google.com/search?q=production+environment)

therefore, it is useful to split such values into constants, and ultimately into configuration objects. We're just taking the first step of a good habit here.


##### where did the mock data go?

I've made a networkMocks directory

```
$ mkdir ./src/networkMocks
$ touch ./src/networkMocks/exercises.js
```

./src/networkMocks/exercises.js
```js
export default [
  // ... the exercises JSON we had before
];
```

that we will use later in this section when we build our offline network layer

we'll see that in a minute, no worries for now - our exercises will load from the server!


##### why are we checking that there are exercises in render now?

remember our ```Dealer``` component loads the initial value of ```this.props.exercises``` into state

./src/Dealer.js
```js
//...
  state = {
    exercises: this.props.exercises,
    //...
  }
//...
```

therefore, if we render ```<Dealer exercises={exercises} .../>``` as before, the first time our ```DoExercise``` component renders - since the API call hasn't finished yet - ```exercises``` will === ```[]``` and our Dealer will be instantiated with an empty array in ```this.state.exercises``` (feel free to try this out running by removing the check)

by checking that ```exercises.length``` (is truthy ie is > 0) before rendering our ```<Dealer />```, we can make sure the Dealer has exercises when it is constructed / rendered for the first time

in a production app, we would want to also check in Dealer, and perhaps wait until ```this.props.exercises.length``` to set the exercises in state (feature challenge)


---


#### connecting to a fake api server (writing)

we still need to save our results to the server! Once we do that, our users will be able to track their progress while they learn.

currently we are logging (aka doing nothing with) our results when we receive them from the ```Dealer```

./src/DoExercise.js
```js
//...

  onResult = results = console.log(results);

//...
```

let's send that data to the POST /result route

| path | method | request body | response |
|:---|:---|:---|:---|
| /result | POST | { resultJSON } | successMessage |


we have from our server

... we'll need to call the api once for each result we receive 

./src/DoExercise.js
```js

  onResult = results =>
    results.forEach( result => fetch(apiDomain+'/result', {
      method: 'POST',
      body: JSON.stringify( result ),
      headers:{ 'Content-Type': 'application/json' },
      
    }).then( res => res.json() ).then( msg=> console.log(msg) ))

//...
```

now on the console in our server's terminal, we should see the POSTed results logged

on the console in the browser, we should see the fake success message for each result.




---


#### (concept) mocking the network call for offline devving

Working in a team project, we might not have a local server available for us to run, or we may not want to rely on it when developing a feature with specific data requirements.

In these cases, it will often be convenient to be able to replace our network calls with "fake network calls", which run asynchronously, but do not rely on any code outside of our front end application to complete, and will always return the data we want them to.


This pattern is called "network mocking" and is one of my favourite tools for maintaining productivity independence for server and front end teams.


Let's see an example of what this might look like here:

```js
//...
import { apiDomain, target } from './networkConfig';
import exerciseMocks from './networkMocks/exercises';

//...

  componentDidMount(){
    if( target === 'server' )
      fetch(apiDomain+'/exercise').then(res => res.json())
                                  .then( exercises => this.setState({ exercises }) );

    else
      setTimeout(()=> this.setState({ exercises: exerciseMocks }), 100);
  }


// ...
```

This is fine if we only have one network call in our entire application - however, as soon as we have more, we won't want to repeat this logic over and over.  Also the ```setTimeout``` will not afford us the conveniences of Promises if we want to chain together any other logic to our network calls (ie rendering a waiting gif, waiting for multiple calls)


We'll need a more general solution which allows us to write real and fake versions of each network call using Promises, and decide which to use based on a single environment variable


The technique we're about to learn has saved me countless hours while developing front-ends AND servers.

We will use a similar technique later when we build "offline mode" into our app.


---


#### separating our network calls from our component logic


Our mission here is to move all of our networkConfig to one place, and all of our network calls to another (which can import the config)

so let's make some files

```
$ touch ./src/networkConfig.js
$ touch ./src/networkCalls.js
```

let's move our apiDomain into the config file where it belongs

./src/networkConfig.js
```js
export const apiDomain= 'http://localhost:4000';
```

and move our network calls to where they belong

./src/networkCalls.js
```js
import { apiDomain } from './networkConfig';

const networkCalls = {
  server: {
    readExercises: ()=> fetch(apiDomain+'/exercise').then(res => res.json()),
    
    createResult: result => fetch(apiDomain+'/result', {
      method: 'POST',
      body: JSON.stringify( result ),
      headers:{ 'Content-Type': 'application/json' },
    }).then( res => res.json() ),
  },
};

export const readExercises = networkCalls.server.readExercises;
export const createResult = networkCalls.server.createResult;
```

(why we've nested them in a dictionary object will be clear in the next step)


now we can use our network calls from ```DoExercise```

./src/DoExercise.js
```js
//...

import Dealer from './Dealer';

import { readExercises, createResult } from './networkCalls';

class DoExercise extends Component {

  state = {
    exercises: [],
  }

  onResult = results =>
    Promise.all( results.map( createResult ) ).then( msgs=> console.log(msgs) )


  componentDidMount(){
    readExercises().then( exercises => this.setState({ exercises }) );
  }

//...
```


```readExercises()``` for now does not require a parameter (later we'll add a ```query``` param when we load exercises by user demand), so we can simply call it and expect our exercises to be resolved to us.


```createResult(result)```, on the other hand, definitely needs a parameter (the result we wish to create)

in this case, as we are creating multiple ```result```s, it is convenient to use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) to wait for all of the ```createResult``` calls to resolve

You'll see that the resolved messages come now as an array (in the browser console)

##### extra learning:

using [Array.prototype.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) to map our results each to an "api-call Promise" and then wrapping that "array of Promises" in a ```Promise.all( ... )``` is a nifty trick that will work whenever we have batch calls.

this also uses [tacit programming style](https://lucasmreis.github.io/blog/pointfree-javascript/), which is a bit [more poetic than imperative](https://codeburst.io/from-imperative-to-functional-javascript-5dc9e16d9184)

---

Now our ```DoExercise``` Component doesn't need to know anything about how the network calls work, so we'll be able to swap them out for fakes very easily.


((feature challenge, we'll respond to the results creation completion by displaying feedback to the user))


---


#### toggling between network targets

As discussed, we want to be able to swap in fake network calls for when we don't want to (or can't) run the server


##### what does a *fake* network call look like?

All a fake network call has to do is act like the real ones

the real calls are just functions that return a Promise:

```js
(some, args)=> {
  //... any logic
  const someData = {}; // this will vary per request

  return Promise.resolve( someData );
}
```

often this type of function is called a ```hook```

in our fakes, it is important that we resolve the same kind of data (```readExercise```'s fake needs to resolve an array of JSON exercises)

we can - if we want - ignore the input arguments, as often in mocks we will simply respond with a mock JSON.


##### ok let's write some fakes!


for ```readExercise``` and ```createResult```, we'll import a mock JSON and resolve it in a Promise


./src/networkCalls.js
```js
import { apiDomain } from './networkConfig';

import exerciseMock from './networkMocks/exercise';
import resultResponseMock from './networkMocks/resultResponse';

const networkCalls = {
  fake: {
    readExercises: ()=> Promise.resolve( exerciseMock ),
    createResult: ()=> Promise.resolve( resultResponseMock ),
  },

  server: {
    //...
  },
};

//...
```


in order to use the fakes (or at least to choose which of the two targets to target) we'll add a ```target``` to our networkConfig

./src/networkConfig.js
```js
export apiDomain = 'http://localhost:4000';

export target = 'fake'; // this is the one value to toggle if we wanted 'server'
```

and we'll use it in ./src/networkCalls.js to decide the exports
```js
import { apiDomain, target } from './networkConfig';

//...

export const readExercises = networkCalls[target].readExercises;
export const createResult = networkCalls[target].createResult;
```

we can now run our app without the ulpan-server running!


to switch back to the server networkCalls (which **do** use the ulpan-server) all we need to do is:

./src/networkConfig.js
```js
//...

export const target = 'server';
```

in some industry applications, the configuration value will be provided to our app from an environment variable, so that the devOps team's deployment system can tell us the correct ```apiDomain``` or ```target``` for a given build

some staging builds will use fakes, and often testing and staging builds will have a specific ```apiDomain``` or domains which point to testing / staging servers.


---


in our next steps, we'll be building out the two other views in our application - all three will share the network layer, so it will make our work simpler that we've organized it properly in advance.


the currently available server API will not be enough to build these routes, as is sometimes the case in real life

in this course, however, we have the choice to work ahead in three different ways:
- build the server routes ourself (full stack course)
- checkout the next step# git branch where the routes are available (front end course)
- mock all the network behaviour on the front end (real life mode)

often in real life, it is the best choice to mock the network calls and wait for the server team to publish the new API routes (and often we don't have a fake server)... if you choose option 3, you're braver than I would be!

---

if this import / export business is new to you, [take a read through anything from the first google result page on the topic](https://www.google.com/search?q=es6+exports)

<img src='https://i.pinimg.com/originals/30/21/b7/3021b793c398c34de3865ffe3ed0ab32.jpg' height=250 width=325/>


---


### step4: build a view level component to CREATE / EDIT exercises

##### running the server

```
$ cd ~/code/ulpan-server

# either work your way through step1's exercises, or
# checkout the relevant point in the version history

$ git checkout step2
$ npm start
```

to run the server locally

---


We have some new features from the server: CREATE exercise route being available will let us build our "create exercise" view finally, first though we have a few updates to DoExercise


#### add pack to result CREATE call with server schema update

The server team now wants us to send along the ```pack``` that an exercise was in with the result. Probably later they'll want to replace this with a [foreign key](https://www.w3schools.com/sql/sql_foreignkey.asp), though for now ```pack``` will allow us to do the query we want.

this will be easy enough to graft on as the result passes through the ```Dealer``` Component

./src/Dealer.js
```js
//...

  onResult = (result)=>
    this.setState(state => ({ results: state.results.concat({
      ...result,
      pack: this.state.exercises[ this.state.currentExercise ].pack,
    }) }))

//...
```
we're using [object rest](https://babeljs.io/docs/en/babel-plugin-transform-object-rest-spread.html) to copy the old result object while grafting a new field onto it.


we can confirm this is working by working through some exercises and:
- checking the "POST /result" calls in the network panel
- running a GET (READ ALL) /result or POST /result/query in POSTMAN to check output

---

#### add select by pack feature to DoExercise view

(( wireframe the UX for packs, select pack, do exercises ... images ))

we can use the mock data from our server to build a component to select which lesson pack we wish to attempt (this will work just the same once we upgrade the server to work with a real database of course)


let's read from the GET /exercise/packs convenience API we just got from the server team.

./src/networkCalls.js
```js
//...

const packsMock = exerciseMock.reduce( (prev, pack)=> ({
  ...prev, [pack]: (prev[pack]||0)+1
}), {});

//... in fake:
    readPacks: ()=> Promise.resolve( packsMock ),

//... in server:
    readPacks: ()=> fetch(apiDomain+'/exercise/packs').then(res => res.json()),

//...
export const readPacks = networkCalls[target].readPacks;
//...
```

maintaining our fake: and server: calls is a habit we should never give up on!

we'll reuse this networkCall in CreateExercise form for pack select.


Now that we can read the { [pack]: SIZE,.. } response, let's load that in our ```componentDidMount``` on ```DoExercise``` to populate a list for the user to select from


./src/DoExercise.js
```js
//...
  componentDidMount(){
    readPacks().then( packs=> this.setState({
      packs: Object.keys(packs).map(pack=> ({ name: pack, size: packs[pack] }) ),
    }) )

   //...
  }

//...
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

//...
```

(( perhaps later we'll also get the tags with this API ))


Now the users will want to click on a pack and have those exercises load

let's implement a networkCall to use our POST /exercise/query API.


---

#### build View from server step2 CREATE w pack and tags

our main goal in this step is to build a view which will allow users to create exercises.

We will make a form which will receive values for each field on the ```exercise``` schema:

```js
  {
    pack: 'cafe',
    tags: ['noun', 'nosh', 'politics'],
    prompt: 'אבטיח מחולק עם פטה בצד',
    answer: [
      'sliced watermelon with feta on the side',
      'why is there feta next to my watermelon???',
    ],
    component: 'FlashCard',
  },
```

Once we've built a working form for each value, we'll add a feature for "pack" to make selecting a previous value easier (choose from list / new pack... UX flow) using the same networkCall we used in DoExercise to populate our pack selection component.



./src/CreateExercise.js
```js
//...
  state = {
    //...
    availablePacks: [],
  }

  componentDidMount(){
    readPacks().then( packs=> this.setState({ availablePacks: Object.keys(packs) }) );
  }
```



For now, since we only have one ```component```, we won't allow the user to change the value -- later we'll want a dropdown ```<select>```.


- inputs for pack and prompt
- array string inputs component
  - apply component to answer, tags
- query available packs (add this to server step1?)

- add networkCall. createExercise




    - build from server step3 EDIT exercise feature (step 6)


### step5: build a view level component to READ && render results



This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).