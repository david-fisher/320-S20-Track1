import React from "react";
import {
  makeStyles,
  Typography,
  Button,
  Avatar,
  Container,
  TextField,
  Grid,
  Badge
} from "@material-ui/core";
import { FilePicker } from 'react-file-picker'
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import ConfirmImageDialog from './ConfirmImageDialog';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(2),
    align: "center",
    padding: 4,
  },
  button: {
    width: "100%",
    marginTop: theme.spacing(2),
    align: "center",
  },
  avatarContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  avatar: {
    width: theme.spacing(25),
    height: theme.spacing(25),
    backgroundColor: "primary",
  },
  uploadDP: {
    width: "100%",
    fullWidth: true,
    marginTop: theme.spacing(2),
    align: "center",
  }
}));

function getLinkedIn(arr) {
  if (!arr) {
    return ""
  }
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i])
    if (arr[i].link_type === "LinkedIn") {
      return arr[i].link
    }
  }
  return ""
}

const ProfileInformation = (props) => {
  const classes = useStyles();
  const { settings } = props;
  const [firstName, setFirstName] = React.useState(settings.first_name);
  const [prefName, setPrefName] = React.useState(settings.preferred_name);
  const [lastName, setLastName] = React.useState(settings.last_name);
  const [pronouns, setPronouns] = React.useState(settings.pronouns);
  const [phoneNumber, setPhoneNumber] = React.useState(settings.phone);
  const [email, setEmail] = React.useState(settings.email);
  const [linkedIn, setLinkedIn] = React.useState(getLinkedIn(settings.link));
  const [bio, setBio] = React.useState(settings.bio);
  const ConfirmImageDialogRef = React.createRef();

  const id = sessionStorage.getItem("id")
  const url =
    "https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/students/" +
    id;

  function handleSubmit() {
    let formatted_majors = settings.major;
    let formatted_minors = settings.minor;
    let formatted_colleges = settings.college;

    if (settings.major === null) {
      formatted_majors = [];
    }
    if (settings.minor === null) {
      formatted_minors = ["Greek"];
    }
    if (settings.college === null) {
      formatted_colleges = [
        {
          college_id: 9,
          college: "College of Information and Computer Sciences",
        },
      ];
    }

    fetch(url, {
      method: "PATCH",
      body: JSON.stringify({
        first_name: firstName,
        bio: bio,
        colleges: formatted_colleges,
        email: email,
        gender: settings.gender,
        grad_student: settings.grad_student,
        grad_year: settings.grad_year,
        last_name: lastName,
        majors: [],
        minors: [],
        phone: phoneNumber,
        preferred_name: prefName,
        pronouns: pronouns,
        resume: settings.resume,  
        statusCode: settings.statusCode,
        colleges: [],
        links: []
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json)
        window.location.reload(false)
      });
  }

  return (
    <Container component="main">
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Profile Information
        </Typography>
        <form className={classes.form}>
          <div
            className={classes.avatarContainer}
          >
            <Badge
              overlap="circle"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                <FilePicker
                  style={{ cursor: 'pointer' }}
                  onChange={(file) => ConfirmImageDialogRef.current.handleProfileChange(file)}
                  extensions={['jpg', 'jpeg', 'png']}
                >
                  <PhotoCameraIcon fontSize="large" />
                </FilePicker>
              }
            >
                <Avatar
                  color="primary"
                  className={classes.avatar}
                  src={settings.picture}
                />
            </Badge>
          </div>
          <br />
          <Grid container>
            <Grid item xs={3}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="First Name"
                required
                disabled
                multiline
                defaultValue={firstName}
                form
                className={classes.form}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid xs={3}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth

                label="Preferred Name"
                multiline
                defaultValue={prefName}
                form
                className={classes.form}
                onChange={(e) => setPrefName(e.target.value)}
              />
            </Grid>
            <Grid xs={4}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Last Name"
                multiline
                disabled
                defaultValue={lastName}
                form
                className={classes.form}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Pronouns"
                multiline
                defaultValue={pronouns}
                form
                className={classes.form}
                onChange={(e) => setPronouns(e.target.value)}
              />
            </Grid>
          </Grid>

          <Grid container>
            <Grid item xs={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                required
                label="Email Address"
                multiline
                disabled
                defaultValue={email}
                form
                className={classes.form}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
            <Grid xs={6}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Phone Number"
                multiline
                defaultValue={phoneNumber}
                form
                className={classes.form}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid>
          </Grid>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="LinkedIn"
            multiline
            defaultValue={linkedIn}
            form
            className={classes.form}
            onChange={(e) => setLinkedIn(e.target.value)}

          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            label="Personal Biography"
            multiline
            rows={4}
            defaultValue={bio}
            form
            className={classes.form}
            onChange={(e) => setBio(e.target.value)}
          />
          <Button
            margin="normal"
            form
            className={classes.Button}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </form>
      </div>
      <ConfirmImageDialog ref={ConfirmImageDialogRef}/>
    </Container>
  );
};

export default ProfileInformation;
