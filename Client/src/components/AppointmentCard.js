import React from 'react';
import { makeStyles, Modal, Button, Grid, Avatar } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Cancel from './cancelAppt'
import Feedback from './feedback'
import ViewFeedback from './viewFeedback'
import ViewCancelReason from './viewCancelReason.js'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
    fontWeight: 'bold',
  },
  gridpic: {
    marginLeft: "80%"
  },
  picture: {
    marginLeft: "55%",
    height: "100%",
  },
  paper: {
    height: "100%",
    width: "130%",
  },
  rating: {
    marginLeft: "20%"
  },
  dayselect: {
    marginLeft: "40%"
  },
  // tagChip: {
  //   margin: theme.spacing(0.5),
  // },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  large: {
    marginLeft: "55%",
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  aptDetails: {
    fontSize: theme.typography.pxToRem(15)
  }
}));


const PreviousAppointmentCard = (props) => {

  const [cancelAppointmentModalOpen, setCancelAppointmentModalOpen] = React.useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = React.useState(false);
  const [viewFeedbackModalOpen, setViewFeedbackModalOpen] = React.useState(false);
  const [viewCancelReasonOpen, setViewCancelReason] = React.useState(false);


  const handleOpenAppointmentModal = () => {
    setCancelAppointmentModalOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    setCancelAppointmentModalOpen(false);
  };
  const handleOpenFeedbackModal = () => {
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
  };

  const handleOpenViewFeedbackModal = () => {
    setViewFeedbackModalOpen(true);
  };

  const handleCloseViewFeedbackModal = () => {
    setViewFeedbackModalOpen(false);
  };

  const handleOpenViewCancelReason = () => {
    setViewCancelReason(true);
  };

  const handleCloseViewCancelReason = () => {
    setViewCancelReason(false);
  };

  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const [date, setDate] = React.useState(15);

  const handleBack = () => {
    setDate(date - 1);
  };

  const handleNext = () => {
    setDate(date + 1);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  //Expansion panel for supporters view
  function supporterViewAppointmentCard() {

    return (

      <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>{props.student}</Typography>
          <Typography className={classes.secondaryHeading}>{props.date + ' from ' + props.start + ' to ' + props.end}</Typography>
          <Typography className={classes.secondaryHeading} style={{ marginLeft: '20%' }}>{props.subject}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography>{props.location}</Typography>
              <Typography>{props.medium}</Typography>
              <br />
              <Typography className={classes.tagChip}>{props.comments}</Typography>

            </Grid>
            <Grid item xs={12} sm={6}>
              <Avatar alt="c" src={props.studentProfilePic}
                className={classes.large} />
            </Grid>
            <Grid item xs={12} align="center">
              {props.cancelled ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenViewCancelReason}
                >
                  View Cancel Reason
                </Button>
              ) : props.upcoming ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAppointmentModal}
                >
                  Cancel Appointment
                </Button>
              ) :
                  (
                    <Button
                      margin="normal"
                      variant="contained"
                      color="primary"
                      onClick={handleOpenViewFeedbackModal}
                      disabled={!props.feedbackLeft}
                    >
                      View Feedback
                    </Button>
                  )}
              <Modal
                open={cancelAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Cancel appt_id={props.appt_id}
                  supporter={props.supporter} />
              </Modal>

              <Modal
                open={viewFeedbackModalOpen}
                onClose={handleCloseViewFeedbackModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewFeedback
                  rating={props.rating}
                  feedback={props.feedback}
                />
              </Modal>

              <Modal
                open={viewCancelReasonOpen}
                onClose={handleCloseViewCancelReason}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewCancelReason cancel_reason={props.cancel_reason} />
              </Modal>

            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
  //Expansion panel for the student's view
  function studentViewAppointmentCard() {
    const curMonth = (month) => {
      switch (month) {
        case '01':
          return 'January';
        case '02':
          return 'February';
        case '03':
          return 'March';
        case '04':
          return 'April';
        case '05':
          return 'May';
        case '06':
          return 'June';
        case '07':
          return 'July';
        case '08':
          return 'August';
        case '09':
          return 'September';
        case '10':
          return 'October';
        case '11':
          return 'November';
        case '12':
          return 'December';
        default:
          return null;
      }
    }
    let aptDate = {
      year: props.date.substring(0,4),
      month: curMonth(props.date.substring(5,7)),
      day: props.date.substring(8)
    } 
    return (
      <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>{props.supporter}</Typography>
          <Typography className={classes.secondaryHeading}>{aptDate.month + ' ' + aptDate.day + ', ' + aptDate.year + ' from ' + props.start + ' to ' + props.end}</Typography>
          <Typography className={classes.secondaryHeading} style={{ marginLeft: '20%' }}>{props.subject}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography className={classes.aptDetails}>Location: {props.location}</Typography>
              <Typography>Topic: {props.subject}</Typography>
              <Typography>Medium: {props.medium}</Typography>
              <Typography /*className={classes.tagChip}*/>Comments: {props.comments}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>

              <Avatar src={props.supporterProfilePic}
                className={classes.large} />

            </Grid>
            <Grid item xs={12} align="center">
              {props.cancelled ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenViewCancelReason}
                >
                  View Cancel Reason
                </Button>
              ) : props.upcoming ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAppointmentModal}
                >
                  Cancel Appointment
                </Button>
              ) : props.feedbackLeft ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenViewFeedbackModal}
                >
                  View Feedback
                </Button>
              ) : (
                      <Button
                        margin="normal"
                        variant="contained"
                        color="primary"
                        onClick={handleOpenFeedbackModal}
                      >
                        Submit Feedback
                      </Button>
                    )
              }
              <Modal
                open={cancelAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Cancel appt_id={props.appt_id}
                  supporter={props.supporter} />
              </Modal>

              <Modal
                open={feedbackModalOpen}
                onClose={handleCloseFeedbackModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Feedback appt_id={props.appt_id} />
              </Modal>

              <Modal
                open={viewFeedbackModalOpen}
                onClose={handleCloseViewFeedbackModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewFeedback
                  rating={props.rating}
                  feedback={props.feedback}
                />
              </Modal>

              <Modal
                open={viewCancelReasonOpen}
                onClose={handleCloseViewCancelReason}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewCancelReason cancel_reason={props.cancel_reason} />
              </Modal>

            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  function adminViewAppointmentCard() {
    return (
      <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography className={classes.heading}>Student: {props.student}</Typography>
          <Typography className={classes.secondaryHeading}>{props.date + ' from ' + props.start + ' to ' + props.end}</Typography>
          <Typography className={classes.secondaryHeading} style={{ marginLeft: '20%' }}>{props.subject}</Typography>
          <Typography className={classes.heading}>Supporter: {props.supporter}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container spacing={3}>
            <Grid container justify="space-around" allignItems="flex-start">
              <Grid item x6={0}>
                <Avatar src={props.studentProfilePic}
                  className={classes.large} />
              </Grid>

              <Grid item x6={0}>
                <Avatar src={props.supporterProfilePic}
                  className={classes.large} />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={6} justify="space-between">

              <Typography>{props.location}</Typography>
              <Typography>{props.medium}</Typography>
              <br />
              <Typography className={classes.tagChip}>{props.comments}</Typography>
              <Typography className={classes.secondaryHeading}>{props.date + ' from ' + props.start + ' to ' + props.end}</Typography>
              <Typography className={classes.secondaryHeading} style={{ marginLeft: '20%' }}>{props.subject}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>


            </Grid>
            <Grid item xs={12} align="center">
              {props.cancelled ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenViewCancelReason}
                >
                  View Cancel Reason
                </Button>
              ) : props.upcoming ? (
                <Button
                  margin="normal"
                  variant="contained"
                  color="primary"
                  onClick={handleOpenAppointmentModal}
                >
                  Cancel Appointment
                </Button>
              ) :
                  (
                    <Button
                      margin="normal"
                      variant="contained"
                      color="primary"
                      onClick={handleOpenViewFeedbackModal}
                      disabled={!props.feedbackLeft}
                    >
                      View Feedback
                    </Button>
                  )}
              <Modal
                open={cancelAppointmentModalOpen}
                onClose={handleCloseAppointmentModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Cancel appt_id={props.appt_id}
                  supporter={props.supporter} />
              </Modal>
              <Modal
                open={viewFeedbackModalOpen}
                onClose={handleCloseViewFeedbackModal}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewFeedback
                  rating={props.rating}
                  feedback={props.feedback} />
              </Modal>

              <Modal
                open={viewCancelReasonOpen}
                onClose={handleCloseViewCancelReason}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ViewCancelReason cancel_reason={props.cancel_reason} />
              </Modal>
            </Grid>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  if (props.role == 'supporter') {
    return supporterViewAppointmentCard();
  }
  if (props.role == 'student') {
    return studentViewAppointmentCard();
  }
  if (props.role == 'admin') {
    return adminViewAppointmentCard();
  }
  else return null;
}

export default PreviousAppointmentCard;