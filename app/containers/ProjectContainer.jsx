import React from 'react'

import firebase from 'APP/server/db'
import Toolbar from '../components/Toolbar'
import Binder from '../components/Binder'
import Trashcan from '../components/Trashcan'
import Editor from '../components/Editor'
import Notes from '../components/Notes'
import Summary from '../components/Summary'
import Resources from '../components/Resources'
import AtomEditor from './AtomEditor'

const projectsRef = firebase.database().ref('projects')
let user
const auth = firebase.auth().onAuthStateChanged(authUser => user = authUser)

export default class extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projects: {},
      project: {},
      root: null,
      children: [],
      childrenKeys: []
    }
    this.listenTo = this.listenTo.bind(this)
  }

  componentDidMount() {
    // When the component mounts, start listening to the fireRef
    // we were given.
    const rootRef = projectsRef.child(this.props.params.id).child('current').child('root').once('value')
    .then(snapshot => { this.setState({root: snapshot.val()}) })
    .then(() => this.listenTo(projectsRef.child(this.props.params.id).child('current'), projectsRef))
    .catch(error => console.error(error))
  }
  componentWillUnmount() {
    // When we unmount, stop listening.
    this.unsubscribe()
  }
  // listen to the fireRef.child
  listenTo(projectRef, projectsRef) {
    // If we're already listening to a ref, stop listening there.
    if (this.unsubscribe) this.unsubscribe()
    // Whenever our ref's value changes, set {value} on our state.
    const listener = projectRef.on('value', snapshot =>
      this.setState({ project: snapshot.val() })
    )
    const listenerProjects = projectsRef.on('value', snapshot => {
      snapshot.forEach(childsnap => {
        let title = childsnap.child('projectTitle').val()
        this.setState({ projects: [ ...this.state.projects, title ] })
      })
    })
    const rootListener = projectRef.child('atoms').child(this.state.root).child('children').once('value', snapshot =>
      snapshot.forEach(childSnap => {
        projectRef.child('atoms').child(childSnap.key).once('value', childSnap => {
          this.setState({ children: [ ...this.state.children, childSnap.val() ], childrenKeys: [ ...this.state.childrenKeys, childSnap.key ] })
        })
      })
    )
    this.unsubscribe = () => {
      projectsRef.off('value', listener)
    }
  }

  render() {
    const uid = user ? user.uid : 'qln1WPVpP1fGQPBRAnigIrhOOi23'
    return (
      <div>
        <div className='col-lg-12'>
          <Toolbar projects={this.state.projects} />
        </div>
        <div className='col-lg-3 sidebar-right'>
          <Binder atoms={this.state.children} projectId={this.props.params.id} keys={this.state.childrenKeys} />
          <Trashcan project={this.state.project} />
        </div>
        <div>
          <AtomEditor uid={uid} projectId={this.props.params.id} atomId={this.props.params.atomId} />
        </div>
      </div>
    )
  }
}

//<Toolbar projects={this.state.projects} />
/*const ProjectContainer = ({children}) =>
  <div>
    {children}
  </div>*/
