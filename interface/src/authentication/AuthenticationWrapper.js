import * as React from 'react';
import history from '../history'
import { withNotifier } from '../components/SnackbarNotification';
import { VERIFY_AUTHORIZATION_ENDPOINT } from '../constants/Endpoints';
import { ACCESS_TOKEN, authorizedFetch } from './Authentication';
import { AuthenticationContext } from './Context';
import jwtDecode from 'jwt-decode';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  loadingPanel: {
    padding: theme.spacing.unit * 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    flexDirection: "column"
  },
  progress: {
    margin: theme.spacing.unit * 4,
  }
});

class AuthenticationWrapper extends React.Component {

  constructor(props) {
    super(props);
    this.refresh = this.refresh.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.state = {
      context: {
        refresh: this.refresh,
        signIn: this.signIn,
        signOut: this.signOut
      },
      initialized: false
    };
  }

  componentDidMount() {
    this.refresh();
  }

  render() {
    return (
      <React.Fragment>
        {this.state.initialized ? this.renderContent() : this.renderContentLoading()}
      </React.Fragment>
    );
  }

  renderContent() {
    return (
      <AuthenticationContext.Provider value={this.state.context}>
        {this.props.children}
      </AuthenticationContext.Provider>
    );
  }

  renderContentLoading() {
    const { classes } = this.props;
    return (
      <div className={classes.loadingPanel}>
        <CircularProgress className={classes.progress} size={100} />
        <Typography variant="h4" >
          Loading...
        </Typography>
      </div>
    );
  }

  refresh() {
    var accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (accessToken) {
      authorizedFetch(VERIFY_AUTHORIZATION_ENDPOINT)
        .then(response => {
          const jwt = response.status === 200 ? jwtDecode(accessToken) : undefined;
          this.setState({ initialized: true, context: { ...this.state.context, jwt } });
        }).catch(error => {
          this.setState({ initialized: true, context: { ...this.state.context, jwt: undefined } });
          this.props.raiseNotification("Error verifying authorization: " + error.message);
        });
    } else {
      this.setState({ initialized: true, context: { ...this.state.context, jwt: undefined } });
    }
  }

  signIn(accessToken) {
    try {
      this.setState({ context: { ...this.state.context, jwt: jwtDecode(accessToken) } });
      localStorage.setItem(ACCESS_TOKEN, accessToken);
    } catch (err) {
      this.setState({ initialized: true, context: { ...this.state.context, jwt: undefined } });
      this.props.raiseNotification("Failed to parse JWT " + err.message);
    }
  }

  signOut() {
    localStorage.removeItem(ACCESS_TOKEN);
    this.setState({
      context: {
        ...this.state.context,
        jwt: undefined
      }
    });
    this.props.raiseNotification("You have signed out.");
    history.push('/');
  }

}

export default withStyles(styles)(withNotifier(AuthenticationWrapper))
