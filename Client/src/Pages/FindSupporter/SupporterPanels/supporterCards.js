import React, { useEffect } from 'react';
import { Chip, Button, Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Badge, Typography  } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Rating from '@material-ui/lab/Rating';
import Cookies from "universal-cookie";
import convertTime from "../convertTime.js"
import timeToString from '../timeToString.js'
import cardStyles from './CardStyles'

const SupporterCard = (props) => {
  //Initialize all the constants
  const {name, rating, employer, title, office, topics, tags, imgsrc, timeBlocks, day, mediums, LinkedIn, supporter_id, score, filtered_tags} = props;
  const classes = cardStyles()
  const cookies = new Cookies();
  const studentID = sessionStorage.getItem("id")
  const email = cookies.get("email");
  const [apptTopic, setApptTopic] = React.useState("");
  const [time, setTime] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [openCreated, setOpenCreated] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [medium, setMedium] = React.useState("")
  const [dur,setDur]=React.useState(topics[apptTopic]!==undefined ? topics[apptTopic].duration : 0)
  const has_tags=supporter_has_tags()
  const startTimes = [];

  //Creates a list of tags that were both filtered by and this supporter has
  function supporter_has_tags(){
    const tag_list=[]
    for(let i=0;i<filtered_tags.length;i++){
      if(tags.includes(filtered_tags[i])){
        console.log("added")
        tag_list.push(filtered_tags[i])
      }
    }
    return tag_list
  }

  function getIndex(i){
    if(has_tags.length <=3 && has_tags.length>0){
      return i-has_tags.length
    }
    return i
  }

  //Handles the expansion panel being expanded to get rid of top 3 tags when expanded
  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  //Sets the appointment topic based on selected chip
  const chipFilter = (item) => { 
    setApptTopic(item);
  }

  //Sets appointment time based on selected chip
  const chipFilterTime = (item) => { 
    setTime(item);
  }

  // Opens modal 1
  const handleButton = (event) => {
    setOpen(true);
  };

  // Closes modal 1
  const handleClose = () => {
    setOpen(false);
  };

  // Closes modal 2
  const handleCloseCreated = () => {
    setOpenCreated(false);
  };

  //Checks that a time and topic was selected
  function validateForm() {
    return apptTopic!=="" && time!=="" && medium!=="";
  };

  //Converts a time string to minutes
  function convertToMin(t){
    return parseInt(t.substring(0, 2))*60+parseInt(t.substring(3,5))
  }

  function convertTopicsToArray(tops){
    var arr = []
    for(var i in tops){
      arr.push(i)
    }
    console.log(arr)
    return arr
  }

  useEffect(() => {
    setDur(topics[apptTopic]!== undefined ? topics[apptTopic].duration : 0)
  });

  const topics_array = convertTopicsToArray(topics)

  //Creates an appointment
  //Calls the API
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  //TODO: always switches to confirmed modal no matter what, because lambda does not retrun status codes
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  function handleCreateAppointment(){
    setOpen(false)
    setOpenCreated(true)
    var supporterComment=`Here is the list of tags the student wanted when making an appointment:\\n`
    for(let i=0;i<has_tags.length;i++){
      supporterComment=`${supporterComment + has_tags[i]}\\n`
    }
    supporterComment=supporterComment+comment
    fetch(
      "https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/appointments/students",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "student_id": studentID.toString(),
            "supporter_id": supporter_id,
            "time_of_appt": day+" "+timeToString(time)+":00",
            "medium": medium,
            "location": office,
            "comment": comment,
            "specialization": apptTopic,
            "selected_tags": filtered_tags,
            "override": false
        })
      }
    )
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        console.log(response)
        return response.json();
      } else {
        throw new Error("Server can't be reached!");
      }
    })
    .then(json => {
      //setOpen(false);
      //setOpenCreated(true);
    })
    .catch(error => {
      console.log(error);
    });
  }

  //Creates a single chip given a start time
  function generateTimeChip(st){
    return <Chip
      clickable 
      value={st}
      variant={(time === st) ? 'default' : 'outlined'}
      disabled={isTimeChipDisabled(st)}
      color="primary" 
      label={convertTime(st)}
      className={classes.tagChip}
      onClick={ () => chipFilterTime(st) }
    />
  }

  function isTimeChipDisabled(st) {
    let today = new Date();
    let currDate = new Date(today);
    currDate.setFullYear(parseInt(day.substring(0, 4)));
    currDate.setMonth(day.substring(5, 7) - 1);
    currDate.setDate(day.substring(8, 10));
    
    if(currDate > today) return false;
    return (st < (today.getHours() * 60 + today.getMinutes()))
  }

  //Pushes all possible start times to an array to be converted to chips
  function generateMultipleTimeChips(s,e){
    let st=convertToMin(s)
    let et=convertToMin(e)
    for(let i=st;i<et;i+=30){
       startTimes.push(i);
    }
  }

  //Maps match scores to strings
  function mapScore(s){
    if(s>.75){
      return "Great Match"
    }else if(s>0.5){
      return "Good Match"
    }else if(s>0.25){
      return "OK Match"
    }else{
      return "Poor Match"
    }
  }

  function getTopThreeTagsNotFiltered(){
    var i=0, j=0
    var arr=[]
    while (i<3 && i<tags.length){
      if(!has_tags.includes(tags[j])){
        arr.push(tags[j])
        i++
      }
      j++
    }
    return arr
  }

 const topThreeTags=getTopThreeTagsNotFiltered()

  return (
    <ExpansionPanel className={classes.supporterCard} expanded={expanded === name} onChange={handleExpand(name)}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
        {////////////////////////////////////////////////
        //This is the header of the expansion panel
        ////////////////////////////////////////////////
        }
        <Grid container>
          <Grid item xs={2}>
            <Typography className={classes.heading}>{name}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography className={classes.heading}>{mapScore(score)}</Typography>
          </Grid>
          <Grid item xs={5}>
            {!expanded && has_tags[0] && <Chip label={has_tags[0]} size="small" className={classes.filtered_tag} /> || 
              !expanded && topThreeTags[getIndex(0)] && <Chip label={topThreeTags[getIndex(0)]} size="small" className={classes.tagChip} />}
            {!expanded && has_tags[1] && <Chip label={has_tags[1]} size="small" className={classes.filtered_tag} /> || 
              !expanded && topThreeTags[getIndex(1)] && <Chip label={topThreeTags[getIndex(1)]} size="small" className={classes.tagChip} />}
            {!expanded && has_tags[2] && <Chip label={has_tags[2]} size="small" className={classes.filtered_tag} /> || 
              !expanded && topThreeTags[getIndex(2)] && <Chip label={topThreeTags[getIndex(2)]} size="small" className={classes.tagChip} />}
          </Grid>
          <Grid item xs={3}>
            <Rating className={classes.rating} name="Supporter Rating" precision={0.5} value={rating} readOnly />
          </Grid>
        </Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        {////////////////////////////////////////////////
        //This is the body of the expansion panel
        ////////////////////////////////////////////////
        }
        <Grid container spacing={3}>
          <Grid item xs={4}>
              <Typography>{employer}, {title}</Typography>
              <Typography>{office}</Typography>
              <br/>
              <Typography>Help Needed Topics:</Typography>
              {topics_array.map(topic => <Chip 
                clickable 
                value={topic}
                variant={(apptTopic === topic) ? 'default' : 'outlined'}
                color="primary" 
                label={topic} 
                className={classes.tagChip}
                onClick={ () => chipFilter(topic) }
              />)}
              <br/>
              <br/>
              <Typography>Select Appointment Time:</Typography>
              {timeBlocks.map(block => generateMultipleTimeChips(block["start"],block["end"]))}
              {startTimes.map(st => generateTimeChip(st))}
              <Typography>Select Appointment Medium:</Typography>
              {mediums.map(med => <Chip 
                clickable 
                value={med}
                variant={(medium === med) ? 'default' : 'outlined'}
                color="primary" 
                label={med} 
                className={classes.tagChip}
                onClick={ () => setMedium(med) }
              />)}
          </Grid>
          <Grid item xs={1} align="center">
          </Grid>
          <Grid item xs={3} align="center">
          <Typography>Supporter Specialties:</Typography>
            {tags.map(tag => (filtered_tags.includes(tag) && <Chip label={tag} size="small" className={classes.filtered_tag} />) 
            || <Chip label={tag} size="small" className={classes.tagChip} />)}
          </Grid>
          <Grid item xs={1}>
          </Grid>
          <Grid item xs={2}>
          {LinkedIn !== "" && (
            <Badge
                overlap="circle"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                badgeContent={
                  <Button className={classes.badgeButton} href={LinkedIn.includes("https") ? LinkedIn : "//"+LinkedIn}>
                    <img border={5}
                      src="https://1000logos.net/wp-content/uploads/2017/03/LinkedIn-Logo.png" 
                      className={classes.badge}/>
                  </Button>
                }
              >
              <Avatar alt={name} src={imgsrc} className={classes.large} />
            </Badge>
          )}
          {LinkedIn === "" && <Avatar alt={name} src={imgsrc} className={classes.large} />}
          </Grid>
          <Grid item xs={12} align="center">
            <Button
                margin="normal"
                variant="contained"
                color="primary"
                onClick={handleButton}
                disabled={!validateForm()}
              >
                Create Appointment
            </Button>
          </Grid>
        </Grid>
        
      </ExpansionPanelDetails>
      {////////////////////////////////////////////////
        //This is the confirm appointment dialog box
        ////////////////////////////////////////////////
      }
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Create appointment with {name}
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Location: {office}
          </Typography>
          <Typography gutterBottom>
            Time: {convertTime(time)} for {dur} minutes on {day}
          </Typography>
          <Typography gutterBottom>
            Appointment Type: {apptTopic}
          </Typography>
          <Typography gutterBottom>
            Appointment Medium: {medium}
          </Typography>
          <Typography gutterBottom>
            Additional Comments: {comment}
          </Typography>
          <TextField
            id="outlined-multiline-static"
            multiline
            fullWidth
            rows="4"
            variant="outlined"
            onChange={e => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCreateAppointment}color="primary">
            Create Appointment
          </Button>
        </DialogActions>
      </Dialog>
       {////////////////////////////////////////////////
        //This is the appointment created dialog box
        ////////////////////////////////////////////////
      }
      <Dialog onClose={handleCloseCreated} aria-labelledby="customized-dialog-title" open={openCreated}>
        <DialogTitle id="customized-dialog-title" onClose={handleCloseCreated}>
          Appointment Created
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Your appointment with {name} has been created.
          </Typography>
          <Typography gutterBottom>
            You will receive a verification email to remind you of your appointment.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus href="/appointments" color="primary">
            View Appointments
          </Button>
        </DialogActions>
      </Dialog>
    </ExpansionPanel>
    
    );
	}
	
export default SupporterCard;
