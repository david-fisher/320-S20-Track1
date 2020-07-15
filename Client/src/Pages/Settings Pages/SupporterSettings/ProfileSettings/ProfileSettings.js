import React from "react"
import {makeStyles, Typography, Button, Avatar, Container, Box, TextField, Grid} from "@material-ui/core";
import SubmitButton from './SubmitButton.js'
import FileUpload from '../../../../components/fileUpload'

const useStyles = makeStyles(theme => ({
    paper: {
      marginTop: theme.spacing(8),
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    },
    form: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
      padding: 4
    },
    button: {
      width: "100%",
      marginTop: theme.spacing(2),
      align: "center",
    },
    avatar: {
        width: theme.spacing(25),
        height: theme.spacing(25)
    },
}));


function handleSubmit(){
    
}

function getLinkedIn(arr){
    if (!arr){
        return ""
    }
    for(let i=0;i<arr.length;i++){
        console.log(arr[i])
        if(arr[i].link_type === "LinkedIn"){
            return arr[i].link
        }
    }
    return ""
}

const ProfileInformation = (props) => {
    const classes=useStyles();
    const {settings} = props
    const [firstName, setFirstName]=React.useState(settings.first_name)
    const [prefName, setPrefName]=React.useState(settings.preferred_name)
    const [lastName, setLastName]=React.useState(settings.last_name)
    const [pronouns, setPronouns]=React.useState(settings.pronouns)
    const [phoneNumber, setPhoneNumber]=React.useState(settings.phone)
    const [email, setEmail]=React.useState(settings.email)
    const [picture, setPicture]=React.useState(settings.picture)
    const [linkedIn, setLinkedIn]=React.useState(getLinkedIn(settings.link))
    const [bio, setBio]=React.useState(settings.bio)
    return (
        <Container component="main">
        <div className={classes.paper}>
            <Typography component="h1" variant="h5">
                Profile Information
            </Typography>
            <form className={classes.form}>
                <Grid container>
                    <Grid item xs={3} sm={5}>

                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Avatar className={classes.avatar} src={picture}/>
                    </Grid>
                    <Grid item xs={3} lg={5}>
                        
                    </Grid>
                </Grid>
                <br/>
                <Grid container>
                    <Grid item xs={3}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            disabled
                            label="First Name"
                            autoFocus
                            defaultValue={firstName}
                            form className={classes.form}
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </Grid>
                    <Grid xs={3}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Preferred Name"
                            autoFocus
                            defaultValue={prefName}
                            form className={classes.form}
                            onChange={e => setPrefName(e.target.value)}
                        />
                    </Grid>
                    <Grid xs={4}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            disabled
                            label="Last Name"
                            autoFocus
                            defaultValue={lastName}
                            form className={classes.form}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Pronouns"
                            autoFocus
                            defaultValue={pronouns}
                            form className={classes.form}
                            onChange={e => setPronouns(e.target.value)}
                        />
                    </Grid>
                </Grid>
                
                <Grid container>
                    <Grid item xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            autoFocus
                            disabled
                            defaultValue={email}
                            form className={classes.form}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid xs={6}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Phone Number"
                            autoFocus
                            defaultValue={phoneNumber}
                            form className={classes.form}
                            onChange={e => setPhoneNumber(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    required
                    label="LinkedIn"
                    autoFocus
                    defaultValue={linkedIn}
                    form className={classes.form}
                    onChange={e => setLinkedIn(e.target.value)}
                />
                <FileUpload
                    onFileChange={
                        (e) => {
                            var fr = new FileReader();
                            fr.readAsDataURL(e.target.files[0]);
                            fr.onloadend = (e) => setPicture(e.target.result);
                        }
                    }
                    FileType="image/*"
                />
                
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    label="Personal Biography"
                    autoFocus
                    multiline
                    rows={4}
                    defaultValue={bio}
                    form className={classes.form}
                    onChange={e => setBio(e.target.value)}
                />
                <SubmitButton
                    firstName={firstName}
                    prefName={prefName}
                    lastName={lastName}
                    picture={picture}
                    pronouns={pronouns}
                    phoneNumber={phoneNumber}
                    email={email}
                    linkedIn={linkedIn}
                    bio={bio}
                />

            </form>
        </div>
        </Container>
    );
}

export default ProfileInformation;