# ulpan project

make your own lessons

get diagnostics

hebrew language shouldn't be a prison!


---

Agenda:

- architecture review: how will we organize our app for future development
  - replaceable Components (standardizing props interface) ((this needs images))
  - props interface for the FlashCard
  - Application Level Components
  - Server architecture
  - API design

- section 1: front end FlashCard Application
  - step0: building and styling a FlashCard Component
    - using stub data for the Exercise Component
  - step1: rendering repeated exercises from a Dealer Component
    - using stub data for multiple exercises
    - mocking onResult network behaviour
  - step2: build an view level component to load exercsises and save results
    - mocking our entire api in a well organized network layer
  - step3: build a view level component to CREATE / EDIT exercises
  - step4: build a view level component to READ && render results

- section 2: Server for saving exercises and results
  - step0: booting an express server
  - step1: defining API routes and their handlers
    - responding with stub data
  - step2: connecting to postgres (involves installation of postgres)
    - hydrating tables with mock data
    - reading data from the db for GET requests
    - saving data from POST requests
    - updating data with PUT or PATCH requests

- section 3: user login and identity
  - step0: making a facebook app id
  - step1: integrating facebook login to our app
  - step2: using our facebook identity for CREATE and READ requests
    - on the front end
    - on the server
  - step3: querying exercise groups (lessons) by user
  - step4: full integration of front end and server

- section 4: deploying a full stack app on heroku with postgres
  - bonus discussion of deployment on AWS / azure cloud runtimes



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

#### Server architecture

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



This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).