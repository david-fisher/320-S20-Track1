import React, { useState } from "react";
import {Container, makeStyles, Typography, Box, Grid, Link, FormHelperText, FormControl, TextField, CssBaseline, Button, withStyles, Dialog, IconButton} from "@material-ui/core";
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import CloseIcon from '@material-ui/icons/Close';
import {Autocomplete} from '@material-ui/lab';
import { Auth } from "aws-amplify";
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
  }
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


export default function SignUp() {
  const classes = useStyles();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [supporterType, setSupporterType] = useState("");
  const [employer, setEmployer] = useState("");
  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");

  const [open, setOpen] =useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };


  function validateForm() {
    return password===password2 && email.length > 0
    && password.length > 0 && password2.length > 0
    && fname.length > 0 && lname.length > 0
    && validEmail(email) && supporterType.length >0
    && employer.length > 0 && title.length > 0
    && validatePass(password);
  }

  function samePass(){
    return password===password2;
  }

  function validEmail(address) {
    return !! address.match(/.+@.+/);
  }

  function handleSubmitButton(event){
    handleSubmit(event)
  }

  const handleSubmit = async event => {
    var username = email;
    event.preventDefault();
      try{
        const signUpResponse = await Auth.signUp({
          username,
          password,
          attributes:{
            email: email,
            given_name: fname,
            family_name: lname,
            profile: "Supporter",
            locale: "supporterType",
            zoneinfo: employer,
            nickname: title,
            address: "team",
            preferred_username: "default",

          },
        })

        setOpen(true)
        console.log('Redirect$$$$$$$$')
        handleClickOpen()
        //setRedirect(true);

      }catch(error){
        console.log("AHHHHHHHHHHWOIPOQIWPU0930838-!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        console.log(error)
        alert(error.message)
      }
    }





  function handleKeyPress(event){
    if(event.key === 'Enter'){
      handleSubmit(event)
    }
  }

  const handleClose = () => {
   setOpen(false);
 };


  const supporterTypes = [
    "Professional Staff",
    'Student Staff',
    'Alumni',
    'Faculty',
    'Other',
  ];

  const teams = [
    'CICS Careers',
    'Ventures'
  ];

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const formStyle = {
    minWidth: '100%'
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Request a supporter account
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="fname"
            label="First Name"
            name="fname"
            autoComplete="fname"
            autoFocus
            onChange={e => setFname(e.target.value)}
          />
          {!validEmail(email) && email.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
                Please enter a valid email
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="lname"
            label="Last Name"
            name="lname"
            autoComplete="lname"
            onChange={e => setLname(e.target.value)}
          />

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            onChange={e => setEmail(e.target.value)}
          />
          {!validatePass(password) && password.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
              Your password should be at least 8 characters long and should include a lowercase, uppercase, and special character.
              </FormHelperText>
            </FormControl>
          )}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={e => setPassword(e.target.value)}
          />
          {!samePass(password, password2) && password.length > 0 && password2.length > 0 && (
            <FormControl className={classes.error} error>
              <FormHelperText>
                Passwords do not match
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
            onKeyPress={handleKeyPress}
          />

          <br/><br/>
          <Autocomplete
            //multiple
            id="supporter-types"
            options= {supporterTypes}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Supporter Types *"
              />
            )}
            onChange={(e,v) => setSupporterType(v)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="employer"
            label="Current Employer"
            name="employer"
            autoComplete="employer"
            onChange={e => setEmployer(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="title"
            label="Title"
            name="title"
            autoComplete="title"
            onChange={e => setTitle(e.target.value)}
          />
          <br/><br/>
          <Autocomplete
          //  multiple
            id="teams"
            options= {teams}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Team (Optional)"
              />
            )}
            onChange={(e,v) => setTeam(v)}
          />
          <br/>
          <Typography align="center" variant="body2">
            By requesing an account you agree to ReachOut's
          </Typography>
          <Grid container align="center">
            <Grid item xs>
              <Link href="/tos" variant="body2" justify="center">
                Terms and Condtitions
              </Link>
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmitButton}
            disabled={!validateForm()}
          >
            Create Account
          </Button>

          <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              Confirm Your Email Address
            </DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom>
              A confirmation email has been sent to {email}. Click on the confirmation link in the email to activate your account.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button autoFocus href="/login" color="primary" variant="contained">
                Back to Sign In
              </Button>
            </DialogActions>
          </Dialog>
          <Grid container>
            <Grid item xs>
              <Link href="/login" variant="body2">
                Back to Sign In
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