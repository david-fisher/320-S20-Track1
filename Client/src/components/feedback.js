import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Rating from '@material-ui/lab/Rating';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@material-ui/icons/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@material-ui/icons/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@material-ui/icons/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import { Grid, Button, TextField } from '@material-ui/core';

const customIcons = {
    1: {
        icon: <SentimentVeryDissatisfiedIcon />,
        label: 'Very Dissatisfied',
    },
    2: {
        icon: <SentimentDissatisfiedIcon />,
        label: 'Dissatisfied',
    },
    3: {
        icon: <SentimentSatisfiedIcon />,
        label: 'Neutral',
    },
    4: {
        icon: <SentimentSatisfiedAltIcon />,
        label: 'Satisfied',
    },
    5: {
        icon: <SentimentVerySatisfiedIcon />,
        label: 'Very Satisfied',
    },
};
function IconContainer(props) {
    const { value, ...other } = props;
    return <span {...other}>{customIcons[value].icon}</span>;
}

IconContainer.propTypes = {
    value: PropTypes.number.isRequired,
};

function handleSubmitFeedback(key, feedbackRate, feedbackString) {
    const id = parseInt(sessionStorage.getItem('id'));
    // const id = 1;
    console.log(key, feedbackString, feedbackRate, id);
    fetch(
        'https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/feedback',
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appointment_id: key,
                feedback: feedbackString,
                rating: feedbackRate,
                student_id: id,
            }),
        }
    )
        .then(response => {
            if (response.status >= 200 && response.status < 300) {
                console.log(response);
                return response.json();
            } else {
                throw new Error("Server can't be reached!");
            }
        })
        .then(json => {
            window.location.reload();
        })
        .catch(error => {
            console.log(error);
        });
}

const Feedback = props => {
    const [feedbackRating, setFeedbackRating] = useState(3);
    const [feedbackText, setFeedbackText] = useState('');
    return (
        <Container component="main">
            <Card style={{ padding: 20, margin: 30 }}>
                <Typography variant="h4" align="center">
                    Submit Feedback
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Typography component="legend">
                        How likely are you to recommend this Supporter to a
                        friend?
                    </Typography>
                    <Rating
                        name="customized-icons"
                        defaultValue={3}
                        getLabelText={value => customIcons[value].label}
                        IconContainerComponent={IconContainer}
                        onChange={e => setFeedbackRating(e.target.value)}
                    />
                </Box>
                <Grid lg={12} style={{ marginLeft: 18, marginTop: 30 }}>
                    <Typography>Additional Comments</Typography>
                    <TextField
                        id="outlined-multiline-static"
                        multiline
                        rows="6"
                        variant="outlined"
                        fullWidth
                        onChange={e => setFeedbackText(e.target.value)}
                    />
                </Grid>
                <Grid
                    lg={12}
                    style={{ display: 'flex', justifyContent: 'center' }}
                >
                    <Button
                        style={{
                            width: 150,
                            color: '#FFFFFF',
                            backgroundColor: '#881c1c',
                            marginTop: 50,
                        }}
                        onClick={() =>
                            handleSubmitFeedback(
                                props.appt_id,
                                parseInt(feedbackRating),
                                feedbackText
                            )
                        }
                    >
                        Submit
                    </Button>
                </Grid>
            </Card>
        </Container>
    );
};

export default Feedback;
