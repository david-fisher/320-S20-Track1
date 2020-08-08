import React, { useEffect } from "react";
import {IconButton, Toolbar, Appbar, Fab, TextField, Slider, Box, AppBar, Drawer, Typography, CssBaseline, CircularProgress, Button, Grid} from '@material-ui/core';
import {Rating, Autocomplete} from '@material-ui/lab';
import Menu from "../../../Navigation/appbar.js";
import SupporterCard from "../SupporterPanels/supporterCards.js"
//import topicsList from "../topics.js"
//import tagsList from "../tags.js"
import convertTime from "../convertTime.js"
import { DatePicker} from "@material-ui/pickers";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import MenuIcon from '@material-ui/icons/Menu';
import {isMobile} from 'react-device-detect';
import useStyles from './MatchingStyles'
import { default as StringDistance } from 'fuzzball';
import { useAlert } from 'react-alert';

const drawerWidth = (isMobile ? "100%" : "25%");

const ResponsiveDrawer = (props) => {
  // Initialize alert
  const alert = useAlert();
 
  //Initialize all of the constants
  const [selectedDate, handleDateChange] = React.useState(new Date());
  const [stateTopics, setStateTopics]=React.useState([]);
  const [stateTags, setStateTags]=React.useState([]);
  const [sliderTime, setSliderTime] = React.useState([540, 1020]);
  const classes = useStyles();
  const [name,setName]=React.useState("");
  const [rating,setRating]=React.useState(0);
  const [isLoaded, setLoaded] = React.useState(false);
  const [supporters, setSupporters] = React.useState([]);
  var today = new Date();
  var nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const [beginDate, setBeginDate] = React.useState(today);
  const [endDate, setEndDate] = React.useState(nextWeek);
  const [filtersOpen, setFiltersOpen] = React.useState(isMobile ? false : true)

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
      if(json.body !== undefined) {
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
    return "https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/supporters?start_date=" + formatDateForFetch(startDate) + "%2000%3A00%3A00&end_date=" + formatDateForFetch(endDate) + "%2000%3A00%3A00";
  }

  function processDateChange(date) {
    var newDate = new Date(date);
    if(date < beginDate || date > endDate) {
      const newBeginDate = new Date(newDate.setDate(date.getDate() - 3));
      setBeginDate(newBeginDate);
      const newEndDate = new Date(newDate.setDate(date.getDate() + 7));
      setEndDate(newEndDate);
      fetchSupporterList(formatFetchURL(newBeginDate, newEndDate));
    }
    handleDateChange(date);
  }

  //This is temporary, will eventually be gotten from lambda
  const blockTime=30;
  
  //For hard filtering. Commented out code will hard filter the given fields
  var newList = (supporters.filter(supporter => supporter.day.substring(0,4)===selectedDate.getFullYear().toString() && 
  supporter.day.substring(8,10)===getTheMonth(selectedDate.getDate().toString()) && supporter.day.substring(5,7)===getTheMonth(selectedDate.getMonth()+1) ));
  
  //supporter => String(supporter.name.toLowerCase()).includes(name.toLowerCase()))).filter(
  //supporter => supporter.rating>=rating).filter(
  //supporter => stateTopics.every(val => supporter.topics.includes(val))).filter(
  //supporter => stateTags.every(val => supporter.tags.includes(val))).filter(
  //supporter => checkTimeInRange(sliderTime[0],sliderTime[1],supporter.timeBlocks)).filter
  
  //Creates a new supporter card a supporter
  const getSupporterCard = (supporterObj, s) => {
    return <SupporterCard {...supporterObj} score={s} filtered_tags={stateTags}/>;
  };

  function formatDateForFetch(date) {
    const next_week_year = date.getFullYear().toString();
    const next_week_month = getTheMonth((date.getMonth() + 1)).toString();
    const next_week_day = getTheMonth(date.getDate().toString());
    const formattedDate = next_week_year + "-" + next_week_month + "-" + next_week_day;
    return formattedDate;
  }

  //Increments day by one
  function nextDay(){
    var newDate = new Date()
    newDate.setMonth(selectedDate.getMonth())
    newDate.setDate(selectedDate.getDate() + 1);
    processDateChange(newDate)
  }

  //Decrements day by one
  function previousDay(){
    var today = new Date();
    var newDate = new Date(today);
    newDate.setMonth(selectedDate.getMonth());
    newDate.setDate(selectedDate.getDate() - 1);
    if(newDate < today) { // We can't schedule appointments in the past.
      alert.error("You can't schedule appointments in the past");
    } else {
      processDateChange(newDate);
    }
  }

  //Sets time based on the slider
  const handleSliderChange = (event, newValue) => {
    setSliderTime(newValue);
  };

  //Converts a string to minutes
  function convertToMin(t){
    return parseInt(t.substring(0, 2))*60+parseInt(t.substring(3,5));
  }

  //Adds a 0 to month when month<10 because js dates are dumb
  function getTheMonth(month){
    if (parseInt(month)>10){
      return month.toString();
    }
    else{
      return "0".concat(month.toString());
    }
  }

  //Checks if the supporter has a slot that fits in to the slider times
  function checkTimeInRange(start,end, timeBlockArray){
    for(let i=0;i<timeBlockArray.length;i++){
      if(start<(convertToMin(timeBlockArray[i]["end"]+blockTime)) && end>(convertToMin(timeBlockArray[i]["start"]+blockTime)) && start!==end){
        return true
      }
    }
    return false
  }
  
  ///////////////////////////
  //This handles the sorting of the supporters
  ///////////////////////////

  //Inputs a supporter and returns their score 
  function score(supporter){
    var supporterScore = 0;

    // Approximate string matching.
    supporterScore += StringDistance.token_set_ratio(name, supporter.name) / 100; // (token_set_ratio gives percentage so we need to scale it)
    let matches = 0;
    for(let i = 0; i < stateTags.length; i++) {
      if(supporter.tags.includes(stateTags[i])) {
        matches++;
      }
    }
    
    for(let i=0; i < stateTopics.length; i++) {
      if(supporter.topics[stateTopics[i]]) {
        matches++;
      }
    }
    
    if(stateTopics.length + stateTags.length > 0) supporterScore += matches/stateTopics.length;
    
    supporterScore += 0.0001 * (supporter.rating - rating)/5;

    if(checkTimeInRange(sliderTime[0],sliderTime[1],supporter.timeBlocks)){
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

  if(!isLoaded){
    return (
      <div align="center">
        <br></br>
        <Typography variant="h4">Loading...</Typography>
        <br></br>
        <CircularProgress />
      </div>
    )
  }

  //If the API is loaded, show the matching page
  else{
    return (
      <div className={classes.root}>
        {/*Handles the appbar sizing*/}
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Menu />
        </AppBar>
        { isMobile && 
          <AppBar position="fixed" className={classes.filtersBar}>
            <Toolbar onClick={e => setFiltersOpen(!filtersOpen)}>
              <IconButton color="primary">
                <MenuIcon/>
              </IconButton>
              <Typography color="primary">
                {filtersOpen ? "Hide Filters" : "Show Filters"}
              </Typography>
            </Toolbar>
          </AppBar>
        }
        { filtersOpen &&
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
          > 
            {/*All of the filters*/}
            <div>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            {isMobile &&
              <>
                <br/>
                <br/>
              </>
            }
            <Typography align="center" variant="h5">Filters</Typography>
            <br/>
            <Autocomplete
              multiple
              className={classes.inputs}
              id="tags-outlined"
              options={Array.from(new Set(supporters.flatMap((supporter) => supporter.topics ? Object.keys(supporter.topics) : [])))}
              value={stateTopics}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Help Needed Topics"
                />
              )}
              onChange={(e,v) => setStateTopics(v)}
            />
            <br/>
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
              placeholder={"Search Supporter"}
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <br/>
            <br/>
            <Typography align="center">What day would you like an appointment on?</Typography>
            <br/>
            <Box align="center">
              <DatePicker
                autoOk
                align="center"
                variant="inline"
                inputProps={{style: {textAlign:'center'}}}
                value={selectedDate}
                onChange={processDateChange}
                minDate={new Date()}
              />
            </Box>
            <br/>
            <br/>
            <Typography align="center" className={classes.inputs} id="range-slider" gutterBottom>
              What is your availability on {selectedDate.toDateString().substring(0,3)+selectedDate.toDateString().substring(3)}?
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
            <br/>
            <Typography align="center">Minimum Required Rating</Typography>
            <br/>
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
        }
        <main className={classes.content}>
          {/*The time selector*/}
          <Grid container alignItems="center" justify="center">
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
              onChange={processDateChange}
              minDate={new Date()}
            />
            </Grid>
            <Grid item>
              <Button onClick={nextDay}>
                <NavigateNextIcon fontSize="large"></NavigateNextIcon>
              </Button>
            </Grid>
          </Grid>
          <br/>
          {newList.length>0 && <Typography align="center" variant={isMobile ? "h6" : "h4"}>Recommended Supporters</Typography>}
          {newList.length===0 && <Typography align="center" variant="h4">We couldn't find a supporter with those attributes. Please try widening your search.</Typography>}
          <br/>
          {/*Maps each supporter to a card*/}
          {newList.map(supporterObj => getSupporterCard(supporterObj, supporterObj.score))}
        </main>
      </div>
    );
  }
}

export default ResponsiveDrawer;
