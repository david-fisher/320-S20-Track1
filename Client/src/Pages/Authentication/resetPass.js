import React, { useState } from "react";
import {Button, Container, withStyles, Dialog, Avatar, CssBaseline, TextField, Link, Grid, Box, Typography, makeStyles, IconButton, FormHelperText, FormControl} from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import {Auth} from 'aws-amplify';
import { withTranslation } from 'react-i18next';
import Copyright from './Copyright';

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

function ResetPass({t, i18n}) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  
  const classes = useStyles();
   function handleSubmitButton(event){

    return handleSubmit
  }

  function handleKeyPress(event){
    if(event.key == 'Enter'){
      return handleSubmit
    }
  }
  const handleSubmit = async event =>{
    event.preventDefault()
    try {
      console.log("Email Sent to ", email)
      await Auth.forgotPassword(email)
      handleClickOpen()
    }catch(error){
      console.log(error)
      alert(error.message)
    }
  }

  function validateForm() {
   return email.length > 0 && validEmail(email);
  }

  function validEmail(address) {
    return !! address.match(/.+@.+/);
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <img  height="175" width="175" src ="cicscareers_logo_3.png"></img>
        <br/>
        <Typography component="h1" variant="h5">
          {t('reset-password')}
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('email')}
            name="email"
            autoComplete="email"
            autoFocus
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {!validEmail(email) && email.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
                {t('invalid-email')}
              </FormHelperText>
            </FormControl>
          )}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!validateForm()}
            onClick={handleSubmitButton()}
          >
            {t("reset-password-button")}
          </Button>
          <Dialog aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="customized-dialog-title" >
              {t('reset-password-requested')}
            </DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
              {t('reset-password-email-sent', {email})}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button autoFocus href="/forgot-password2" color="primary">
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <Grid container>
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

export default withTranslation('auth')(ResetPass)