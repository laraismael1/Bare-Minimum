import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';


import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from './Reducers';
import { connect } from 'react-redux';

const store = createStore(reducer.travelReducer);
const { getState } = store;

import TripManager from './components/tripManager/tripManager.jsx';
import TripDashboard from './components/tripDashboard/tripDashboard.jsx';
import MapboxViewer from './components/mapboxViewer.jsx';
import ExpenseTracker from './components/expenseTracker/expenseTracker.jsx';

const SERVER_URL = HOSTNAME;

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		//Listen to changes in the redux store
		store.subscribe(() => {this.setState({reload:false})});
		this.state = {
			trips: []
		};
	}
	componentWillMount () {
		//Get login user
		$.get(SERVER_URL + '/loginuser').then((data) => {
      console.log('Success:', data[0]);
			store.dispatch(reducer.changeUser(data[0]));
			this.fetchLists();
    }).catch((err) => {
      console.error('Error getting login user', err);
    });
	}

	fetchLists() {
		let options = { userId: store.getState().user.id };
		let self = this;
		$.ajax({
			url: SERVER_URL + '/fetchtrips',
			data: options,
			success: function(res) {
				self.setState({ trips: res });
				console.log('Fetched trips:', self.state.trips);
			}
		});
	}

	handleLogout () {
		$.post(SERVER_URL + '/logout').then((reply) => {
			console.log('Logged out');
			location.reload();
		}).catch((err) => {
			console.error('Error!', err);
		});
	};

	getViewComponent () {
		if (store.getState().view === 'TripManager') {
			return <TripManager trips={this.state.trips} />;
		} else if (store.getState().view === 'ExpenseTracker') {
			return <ExpenseTracker />;
		} else {
			return <TripDashboard />;
		}
	}

	render() {
		return(
			<div>
				Logged in as: {store.getState().user.email}
				<button onClick={this.handleLogout}>Log out</button>
				<button onClick={() => store.dispatch(reducer.changeView('ExpenseTracker'))}>Expenses Test</button>
				{this.getViewComponent()}
			</div>
		)
	}
}

ReactDOM.render(
	<Provider store={store}>
		<Dashboard />
	</Provider>
	, document.getElementById('app'));
