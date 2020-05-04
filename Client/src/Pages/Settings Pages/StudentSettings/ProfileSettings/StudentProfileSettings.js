import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Button,
  Avatar,
  Container,
  TextField,
  Grid,
  CircularProgress,
} from "@material-ui/core";
import Cookies from "universal-cookie";

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
  avatar: {
    marginLeft: "38%",
    marginRight: "50%",
    width: theme.spacing(25),
    height: theme.spacing(25),
    backgroundColor: "primary",
  },
}));

const ProfileInformation = (props) => {
  const classes = useStyles();
  const { settings } = props;
  console.log(settings.college)
  const [firstName, setFirstName] = React.useState(settings.first_name);
  const [prefName, setPrefName] = React.useState(settings.preferred_name);
  const [lastName, setLastName] = React.useState(settings.last_name);
  const [pronouns, setPronouns] = React.useState(settings.pronouns);
  const [phoneNumber, setPhoneNumber] = React.useState(settings.phone);
  const [email, setEmail] = React.useState(settings.email);
  const [linkedIn, setLinkedIn] = React.useState(settings.link);
  const [bio, setBio] = React.useState(settings.bio);
  const [picture, setPicture] = React.useState(settings.picture);
  const [grad_year, setGradYear] = React.useState(settings.grad_year);

  const id = sessionStorage.getItem("id")
  const url =
    "https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/students/" +
    id;

  function handleSubmit() {
    let formatted_majors = settings.major;
    let formatted_minors = settings.minor;
    let formatted_colleges = settings.college;
    console.log(settings.major);

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
    console.log(formatted_majors);
    console.log(settings.grad_year)
    console.log({
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
      picture: picture,
      preferred_name: prefName,
      pronouns: pronouns,
      resume: settings.resume,
      statusCode: settings.statusCode,
      links: []
    })
    // console.log(formatted_minors);
    // console.log(formatted_colleges);
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
        picture: picture,
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
          <Avatar
            // alt={firstName}
            color="primary"
            className={classes.avatar}
            src={picture}
          />
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
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default ProfileInformation;