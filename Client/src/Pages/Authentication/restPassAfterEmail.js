import React, { useState } from "react";
import { makeStyles, Button, CssBaseline, TextField, Link, Grid, Box, Typography, Container, FormHelperText, FormControl, Dialog, withStyles, IconButton} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import {Auth} from 'aws-amplify';
import Copyright from './Copyright';
import {withTranslation} from 'react-i18next';

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

function SignIn({t, i18n}) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [codeCorrect, setCodeCorrect] = useState(true);
  const [emailCorrect, setEmailCorrect] = useState(true);
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  function  handleSubmitButton(event){
    setCodeCorrect(true)
    setEmailCorrect(true)
    Auth.forgotPasswordSubmit(email, code, password)
    .then(data => handleClickOpen())
    .catch(err => handleError(err));

  }

  function handleError(error){
    console.log(error)
    if (error.code === "CodeMismatchException"){
        setCodeCorrect(false)
        return
    }
    if (error.code === "ExpiredCodeException"){
      setEmailCorrect(false);
      return
    }
    else{
      alert(error.message)
    }
  }

  function validateForm() {
    return password===password2 && password.length > 0 && password2.length > 0 && code.length > 0 & email.length > 0 && validEmail(email);
  }

  function hasLowerCase(str) {
      return str.toUpperCase() !== str;
  }
  function hasUpperCase(str) {
    return str.toLowerCase() !== str
  }

  function containsSpecial(str){
   return /[\s~`!@#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?()\._]/g.test(str);
  }

    function validatePass(pass){
      return pass.length>=8 && hasUpperCase(pass) && hasLowerCase(pass) && containsSpecial(pass);
    }
  function samePass(){
    return password===password2;
  }

  function validEmail(address) {
    return !! address.match(/.+@.+/);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="verification code"
            label={t('enter-verification-code')}
            type="code"
            id="code"
            onChange={e => setCode(e.target.value)}
          />
          {!codeCorrect && (
            <FormControl className={classes.error} error>
              <FormHelperText>
              {t('invalid-verification-code')}
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="Email address"
            label={t('email')}
            type="email"
            id="email"
            onChange={e => setEmail(e.target.value)}
          />
          {!emailCorrect && (
            <FormControl className={classes.error} error>
              <FormHelperText>
                This email is incorrect or the code has expired.
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="new password"
            label="New Password"
            type="password"
            id="New_password"
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />
          {!validatePass(password) && password.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
              {t('invalid-password')}
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="confirm password"
            label="Confirm Password"
            type="password"
            id="Confirmpassword"
            autoComplete="current-password"
            onChange={e => setPassword2(e.target.value)}
          />
          {!samePass(password, password2) && password.length > 0 && password2.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
                {t('passwords-unmatch')}
              </FormHelperText>
            </FormControl>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmitButton}
            disabled={!validateForm()}
          >
            Reset My Password
          </Button>
          <Grid container>
          <Dialog aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="customized-dialog-title">
              Password Changed
            </DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
              Your password has been successfully changed.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button autoFocus href="/login" color="primary">
                Back to Sign in
              </Button>
            </DialogActions>
          </Dialog>
            <Grid item>
              <Link href="/login" variant="body2">
                {"Back to sign in"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default withTranslation('auth')(SignIn);