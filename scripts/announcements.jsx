import React from 'react';
import ReactDOM from 'react-dom';
import { List } from 'immutable';
import Timeago from 'react-timeago';

console.log('Announcements.js Loaded');

class Announcements extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      announcements: List(),
    }
    this.ws;
  }

  getMsgsFromDB = async () => {
    const res = await fetch(URL, {
      method: 'post',
    });
    const msgs = await res.json();

    this.setState({
      announcements: List(msgs)
    });
  }

  connectToWebSocket = () => {
    const HOST = 'wss://vandyhacksnotifications.herokuapp.com/';
    this.ws = new WebSocket(HOST);

    this.ws.onmessage = event => {
      console.log(`event.data=${event.data}`);
      let msg;
      if (event.data === 'reload') {
        window.location.reload();
      } else {
        msg = JSON.parse(event.data);
      }

      this.setState(curState => {
        announcements: curState.announcements.unshift(msg)
      });

      this.ws.onclose = this.connectToWebSocket;
    }
  }

  componentWillMount() {
    this.getMsgsFromDB();
    this.connectToWebSocket();
  }

  render() {
    return <ul className="announcements-col container-fluid" id="announcements-col">
      {this.state.announcements.map((msg, index) => {
        <li key={index} className='message'>
          <Timeago className='announcement-when' date={msg.time} />
          <span className='announcement-what'>{msg.msg}</span>
        </li>
      })}
    </ul>
  }
}

const container = document.getElementById('announcements');
ReactDOM.render(<Announcements />, container);
