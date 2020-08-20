import React, { useEffect } from "react";
import { TextField, Slider, Box, AppBar, Drawer, Typography, CssBaseline, CircularProgress, Button, Grid } from '@material-ui/core';
import { Rating, Autocomplete } from '@material-ui/lab';
import Menu from "../../../Navigation/appbar.js";
import SupporterCard from "../SupporterPanels/supporterCards.js"
//import topicsList from "../topics.js"
//import tagsList from "../tags.js"
import convertTime from "../convertTime.js"
import { DatePicker } from "@material-ui/pickers";
import useStyles from "./MatchingStyles.js"
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import { default as StringDistance } from 'fuzzball';
import moment from 'moment-timezone';
import { useAlert } from 'react-alert';
import { withTranslation } from 'react-i18next';

function ResponsiveDrawer({ t, i18n }) {
  // Initialize alert
  const alert = useAlert();

  //Initialize all of the constants
  const [selectedDate, handleDateChange] = React.useState(moment().startOf('day'));
  const [stateTopics, setStateTopics]=React.useState([]);
  const [stateTags, setStateTags]=React.useState([]);
  const [sliderTime, setSliderTime] = React.useState([540, 1020]);
  const classes = useStyles();
  const [name, setName] = React.useState("");
  const [rating, setRating] = React.useState(0);
  const [isLoaded, setLoaded] = React.useState(false);
  const [supporters, setSupporters] = React.useState([]);
  const [beginDate, setBeginDate] = React.useState(moment().startOf('day'));
  const [endDate, setEndDate] = React.useState(moment().startOf('day').add(7, 'days'));
  
  const initial_fetch_url = formatFetchURL(beginDate, endDate);

  //Calls the API to get the list of supporters
  useEffect(() => {
    fetchSupporterList(initial_fetch_url);
  }, [])

  // Refer to this: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
  async function myFetch(url) {
    let response = await fetch(url);
    let json = await response.json();
    return json;
  }

  function fetchSupporterList(url) {
    setLoaded(false);
    myFetch(url).then((json) => {
      if (json.body !== undefined) {
        setSupporters(json.body);
        setLoaded(true);
      } else {
        setLoaded(true);
        throw new Error();
      }
    })
      .catch(error => {
        setLoaded(true);
        console.log("No Supporters Found")
      });
  }

  function formatFetchURL(startDate, endDate) {
    return "https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/supporters/testmethod?start_date=" + encodeURI(startDate.tz('America/New_York').format('YYYY-MM-DD HH:MM:SS')) + "&end_date=" + encodeURI(endDate.tz('America/New_York').format('YYYY-MM-DD HH:MM:SS'));
  }

  function processDateChange(date) {
    if(date.isBefore(beginDate) || date.isAfter(endDate)) {
      setBeginDate(moment().subtract(3, 'days'));
      setEndDate(moment().add(7, 'days'));
      fetchSupporterList(formatFetchURL(beginDate, endDate));
    }

    handleDateChange(date);
  }

  //This is temporary, will eventually be gotten from lambda
  const blockTime = 30;

  //For hard filtering. Commented out code will hard filter the given fields
  var newList = [];
  for(let supporter of supporters) {
    let filteredSupporter = Object.assign({}, supporter, {timeBlocks: supporter.timeBlocks.filter(timeBlock => moment.tz(timeBlock['start'], 'America/New_York').isSame(selectedDate, 'day'))});
    if(filteredSupporter.timeBlocks.length > 0)
      newList.push(filteredSupporter);
  }
  //supporter => String(supporter.name.toLowerCase()).includes(name.toLowerCase()))).filter(
  //supporter => supporter.rating>=rating).filter(
  //supporter => stateTopics.every(val => supporter.topics.includes(val))).filter(
  //supporter => stateTags.every(val => supporter.tags.includes(val))).filter(
  //supporter => checkTimeInRange(sliderTime[0],sliderTime[1],supporter.timeBlocks)).filter

  //Creates a supporter card a supporter
  const getSupporterCard = (supporterObj, s) => {
    return <SupporterCard {...supporterObj} score={s} filtered_tags={stateTags} />;
  };

  //Increments day by one
  function nextDay(){
    // Need to create new object instead of mutating current to rerender the component.
    processDateChange(moment(selectedDate.add(1, 'days')));
  }

  //Decrements day by one
  function previousDay(){
    if(moment().isSameOrAfter(selectedDate, 'day')) {
      alert.error("You can't schedule appointments in the past"); // We can't schedule appointments in the past.
    } else {
      // Need to create new object instead of mutating current to rerender the component.
      processDateChange(moment(selectedDate.subtract(1, 'days')));
    }
  }

  //Sets time based on the slider
  const handleSliderChange = (event, newValue) => {
    setSliderTime(newValue);
  };

  //Converts a string to minutes
  function convertToMin(t) {
    return parseInt(t.substring(0, 2))*60+parseInt(t.substring(3,5));
  }

  //Checks if the supporter has a slot that fits in to the slider times
  function checkTimeInRange(start, end, timeBlockArray) {
    for (let i = 0; i < timeBlockArray.length; i++) {
      if (start < (convertToMin(timeBlockArray[i]["end"] + blockTime)) && end > (convertToMin(timeBlockArray[i]["start"] + blockTime)) && start !== end) {
        return true
      }
    }
    return false
  }

  ///////////////////////////
  //This handles the sorting of the supporters
  ///////////////////////////

  //Inputs a supporter and returns their score 
  function score(supporter) {
    var supporterScore = 0;

    // Approximate string matching.
    supporterScore += StringDistance.token_set_ratio(name, supporter.name) / 100; // (token_set_ratio gives percentage so we need to scale it)
    let matches = 0;
    for (let i = 0; i < stateTags.length; i++) {
      if (supporter.tags.includes(stateTags[i])) {
        matches++;
      }
    }

    for (let i = 0; i < stateTopics.length; i++) {
      if (supporter.topics[stateTopics[i]]) {
        matches++;
      }
    }

    if (stateTopics.length + stateTags.length > 0) supporterScore += matches / stateTopics.length;

    supporterScore += 0.0001 * (supporter.rating - rating) / 5;

    if (checkTimeInRange(sliderTime[0], sliderTime[1], supporter.timeBlocks)) {
      supporterScore++
    }
    return supporterScore;
  }

  // Maps every supporter / score pair to the score dictionary
  newList.forEach(supporter => supporter.score = score(supporter));

  // Sort the newList
  newList = newList.sort((a, b) => b.score - a.score);

  /////////////////////////////////////////////////
  //end
  ////////////////////////////////////////////////

  //Display a loading screen if the API is still being called

  if (!isLoaded) {
    return (
      <div align="center">
        <br></br>
        <Typography variant="h4">{t('student.loading')}</Typography>
        <br></br>
        <CircularProgress />
      </div>
    )
  }

  //If the API is loaded, show the matching page
  else {
    return (
      <div className={classes.root}>
        {/*Handles the appbar sizing*/}
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Menu />
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          {/*All of the filters*/}
          <div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <Typography align="center" variant="h5">{t('student.findSupporter')}</Typography>
            <br />
            <Autocomplete
              multiple
              className={classes.inputs}
              id="tags-outlined"
              options={Array.from(new Set(supporters.flatMap((supporter) => supporter.topics ? Object.keys(supporter.topics) : [])))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Help Needed Topics"
                />
              )}
              onChange={(e, v) => setStateTopics(v)}
            />
            <br />
            <Autocomplete
              multiple
              className={classes.inputs}
              id="tags-outlined"
              options={Array.from(new Set(supporters.flatMap((supporter) => supporter.tags ?? [])))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Supporter Specialties"
                />
              )}
              onChange={(e, v) => setStateTags(v)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              className={classes.inputs}
              align="center"
              placeholder="Search Supporter"
              onChange={e => setName(e.target.value)}
            />
            <br />
            <br />
          <Typography align="center">{t('student.topic')}</Typography>
          <br/>
          <Box align="center">
            <DatePicker
              autoOk
              align="center"
              variant="inline"
              inputProps={{style: {textAlign:'center'}}}
              value={selectedDate}
              onChange={(date) => processDateChange(moment(date))}
              disablePast
            />
          </Box>
          <br/>
          <br/>
          <Typography align="center" className={classes.inputs} id="range-slider" gutterBottom>
            What is your availability on {selectedDate.format('ddd  MMM D YYYY')}?
          </Typography>
            <Slider
              value={sliderTime}
              onChange={handleSliderChange}
              step={30}
              min={420}
              max={1140}
              defaultValue={[540, 1020]}
              valueLabelDisplay="off"
              aria-labelledby="range-slider"
              className={classes.inputs}
              getAriaValueText={convertTime}
            />
            <Typography align="center" className={classes.inputs} id="range-slider" gutterBottom>
              {convertTime(sliderTime[0])} - {convertTime(sliderTime[1])} EST
          </Typography>
            <br />
            <Typography align="center">{t('student.rating')}</Typography>
            <br />
            <Box align="center">
              <Rating
                className={classes.rating}
                name="Supporter Rating"
                precision={0.5}
                value={rating}
                onChange={e => setRating(e.target.value)}
                size="large"
              />
            </Box>
          </div>
        </Drawer>
        <main className={classes.content}>
          {/*The time selector*/}
          <Grid container alignItems="center" spacing={2} justify="center">
            <Grid item>
              <Button onClick={previousDay}>
                <NavigateBeforeIcon fontSize="large"></NavigateBeforeIcon>
              </Button>
            </Grid>
            <Grid item>
              <DatePicker
              autoOk
              align="center"
              variant="inline"
              inputProps={{style: {textAlign:'center'}}}
              value={selectedDate}
              onChange={(date) => processDateChange(moment(date))}
              disablePast
            />
            </Grid>
            <Grid item>
              <Button onClick={nextDay}>
                <NavigateNextIcon fontSize="large"></NavigateNextIcon>
              </Button>
            </Grid>
          </Grid>
          <br />
          <br />
          {newList.length > 0 && <Typography align="center" variant="h4">{t('student.appointmentSupporter')}</Typography>}
          {newList.length === 0 && <Typography align="center" variant="h4">{t('student.notFoundSupporter')}</Typography>}
          <br />
          <br />
          {/*Maps each supporter to a card*/}
          {newList.map(supporterObj => getSupporterCard(supporterObj, supporterObj.score))}
        </main>
      </div>
    );
  }
}

export default withTranslation('student')(ResponsiveDrawer);
