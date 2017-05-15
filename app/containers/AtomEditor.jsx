import React from 'react'
import Editor from '../components/Editor'
import Notes from '../components/Notes'
import Summary from '../components/Summary'
import Resources from '../components/Resources'

import firebase from 'APP/server/db'
const projectsRef = firebase.database().ref('projects')

export default class AtomEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      atomVal: {},
      snapshotName: '',
    }
  }

  componentDidMount() {
    // When the component mounts, start listening to the fireRef
    // we were given.
    this.listenTo(firebase.database().ref('users').child(this.props.uid).child('projects').child(this.props.projectId))
  }
  componentWillUnmount() {
    // When we unmount, stop listening.
    this.unsubscribe()
  }
  // listen to the fireRef.child
  listenTo(atomRef) {
    // If we're already listening to a ref, stop listening there.
    if (this.unsubscribe) this.unsubscribe()
    // Whenever our ref's value changes, set {value} on our state.
    const listener = atomRef.on('value', snapshot => {
      this.setState({ atomVal: snapshot.val() })
    })
    this.unsubscribe = () => {
      atomRef.off('value', listener)
    }
  }
  handleChange = (evt) => {
    this.setState({snapshotName: evt.target.value})
  }

  snapshot = (evt) => {
    evt.preventDefault()
    projectsRef.child(this.props.projectId).once('value', snapshot => {
      const snapshotObj = snapshot.val()
      snapshotObj.title = this.state.snapshotName
      snapshotObj.timeStamp = Date.now() // can format as needed
      snapshotObj.snapshots = null // removing snapshots of new snapshot to preserve space
      snapshotObj.messages = null // removing messages of new snapshot to preserve space
      snapshotObj.collaborators = null // removing collaborators from snapshot
      projectsRef.child(this.props.projectId + '/snapshots').push(snapshotObj)
    })
    this.setState({snapshotName: ''})
  }
  render() {
    const ref = this.state.atomRef || projectsRef.child(this.props.projectId).child('current').child('atoms').child(this.props.atomId)
    return (
      <div>
          <Editor atomRef={ref} snapshot={this.snapshot} handleChange={this.handleChange} snapshotName={this.state.snapshotName}/>
        <div className='col-xs-3 sidebar-right'>
          <Summary atomRef={ref} />
          <Notes atomRef={ref} />
        </div>
      </div>
    )
  }
}

// add resources function later for now
// <Resources atom={this.state.selected} />
