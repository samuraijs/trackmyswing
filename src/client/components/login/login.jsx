import React, { Component } from 'react';
import API from '../../libs/api.jsx';
import FacebookLogin from 'react-facebook-login';
import FacebookApi from '../../classes/FacebookApi.jsx';
import configs from '../../config/config';

require('./login.scss');

const DIVISIONS = [
  { Key: 'champion', Label: 'Champions' },
  { Key: 'allstar', Label: 'All-Stars' },
  { Key: 'advanced', Label: 'Advanced' },
  { Key: 'intermediate', Label: 'Intermediate' },
  { Key: 'novice', Label: 'Novice' },
  { Key: 'newcomer', Label: 'Newcomer' },
];
const ROLES = [
  { Key: 'leader', Label: 'Leader' },
  { Key: 'follower', Label: 'Follower' },
];

const DefaultAccountData = {
  email: '',
  password: '',
};

const ApiService = new API();
export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: Object.assign({}, DefaultAccountData),
      loggedIn: false,
    };
    this.api = new API();
  }

  componentDidMount() {
    // Change this page to be the /login page
    // Check to see if user is logged into wcsconnect, if so, redirect to profile page
    // If user is not logged in, have them log in with their username or with facebook.
    // If user logs in with facebook, have them redirect to wcsconnect where we gather their wsdcid number, then send them to the profile page
    // Login status received
    // FacebookApi.GetLoginStatus()
    // 	.then(result => {
    // 		console.log('Status result: ', result);
    // 		// Check to see if user is logged in with facebook
    // 		if (result.status === 'connected') {
    // 			this.setState({ loggedIn: true });
    // 		}
    // 	})
    // 	.catch(error => {
    // 		console.log(error);
    // 	});
    this.api
      .getLogin()
      .then(data => {
        if (data.accountId) {
          this.props.history.push(`/profile/${data.accountId}`);
        } else {
          console.log('Bad account data: ', data);
        }
      })
      .catch(error => {
        // Not logged in
      });
  }

  login() {
    ApiService.Login(this.state.form)
      .then(accountData => {
        this.props.history.push('/profile/' + accountData.accountId);
      })
      .catch(error => {
        console.log('Api error: ', error);
      });
  }

  onEmailUpdate($event) {
    $event.preventDefault();
    let form = this.state.form;
    this.setState({
      form: Object.assign({}, form, { email: $event.target.value }),
    });
  }

  onPasswordUpdate($event) {
    $event.preventDefault();
    let form = this.state.form;
    this.setState({
      form: Object.assign({}, form, { password: $event.target.value }),
    });
  }

  onLoginClicked() {
    this.login();
  }
  /**
   * Handle facebook stuffs
   * @param {} data
   */
  responseFacebook(data) {
    // TODO: Sanitize the crap out of this!!
    // this.createAccount();
    if (!data.email) {
      return;
    }
    // Get user by email
    this.api
      .GetAccountByEmail(data.email)
      .then(account => {
        return ApiService.Login(data.email, null, data.id);
      })
      .then(loginData => {
        this.props.history.push(`/profile/${loginData}`);
      })
      .catch(error => {
        console.log('Account error: ', error);
      });
  }
  render() {
    return (
      <main>
        <header className='header'>
          <h1>Login</h1>
        </header>
        <section className='content-area'>
          <div className='login-container'>
            <div className='login-container-row'>
              <label className='login-label' htmlFor='email'>
                Email:{' '}
              </label>
              <input
                className='login-value'
                name='email'
                id='email'
                type='email'
                value={this.state.form.email}
                onChange={e => this.onEmailUpdate(e)}
              />
            </div>
            <div className='login-container-row'>
              <label className='login-label' htmlFor='password'>
                Password:{' '}
              </label>
              <input
                className='login-value'
                name='password'
                id='password'
                type='password'
                value={this.state.form.password}
                onChange={e => this.onPasswordUpdate(e)}
              />
            </div>
            <button
              className='login-container-action'
              onClick={e => this.onLoginClicked(e)}
            >
              Login
            </button>
          </div>
          <FacebookLogin
            appId={configs.FACEBOOK_APP_ID}
            autoLoad={false}
            fields={configs.FACEBOOK_FIELDS}
            scope={configs.FACEBOOK_SCOPES}
            cssClass='facebook-login'
            textButton='Login with Facebook'
            size='medium'
            callback={e => this.responseFacebook(e)}
          />
          <a href='/create'>Create Account</a>
        </section>
      </main>
    );
  }
}
