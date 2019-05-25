import React from 'react';
import PropTypes from 'prop-types';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import PasswordValidator from '../components/PasswordValidator';

const styles = theme => ({
  textField: {
    width: "100%"
  },
  button: {
    margin: theme.spacing.unit
  }
});

class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  componentWillMount() {
    ValidatorForm.addValidationRule('uniqueUsername', this.props.uniqueUsername);
  }

  submit = () => {
    this.formRef.current.submit();
  }

  render() {
    const { classes, user, creating, handleValueChange, handleCheckboxChange, onDoneEditing, onCancelEditing } = this.props;
    return (
      <ValidatorForm onSubmit={onDoneEditing} ref={this.formRef}>
        <Dialog onClose={onCancelEditing} aria-labelledby="modify-user-dialog-title" open={true} scroll="paper">
          <DialogTitle id="modify-user-dialog-title">Modify User</DialogTitle>
          <DialogContent>
            <TextValidator
              validators={creating ? ['required', 'uniqueUsername', 'matchRegexp:^[a-zA-Z0-9_\\.]{1,24}$'] : []}
              errorMessages={creating ? ['Username is required', "That username already exists", "Must be 1-24 characters: alpha numberic, '_' or '.'"] : []}
              name="username"
              label="Username"
              className={classes.textField}
              value={user.username}
              disabled={!creating}
              onChange={handleValueChange('username')}
              margin="normal"
            />
            <PasswordValidator
              validators={['required', 'matchRegexp:^.{0,64}$']}
              errorMessages={['Password is required', 'Password must be 64 characters or less']}
              name="password"
              label="Password"
              className={classes.textField}
              value={user.password}
              onChange={handleValueChange('password')}
              margin="normal"
            />
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={user.admin} onChange={handleCheckboxChange('admin')} id="admin" />}
                label="Admin?"
              />
            </FormGroup>
          </DialogContent>
          <DialogActions >
            <Button variant="contained" color="primary" className={classes.button} type="submit" onClick={this.submit}>
              Done
            </Button>
            <Button variant="contained" color="secondary" className={classes.button} type="submit" onClick={onCancelEditing}>
              Cancel
            </Button>            
          </DialogActions>
        </Dialog>
      </ValidatorForm>
    );
  }
}

UserForm.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  creating: PropTypes.bool.isRequired,
  onDoneEditing: PropTypes.func.isRequired,
  onCancelEditing: PropTypes.func.isRequired,
  uniqueUsername: PropTypes.func.isRequired,
  handleValueChange: PropTypes.func.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired
};

export default withStyles(styles)(UserForm);
