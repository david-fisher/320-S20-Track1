import React from 'react';
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
import { Grid } from '@material-ui/core';

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

const ViewFeedback = props => {
    const rating = props.rating === null ? 3 : props.rating;
    return (
        <Container component="main">
            <Card style={{ padding: 20, margin: 30 }}>
                <Typography variant="h4" align="center">
                    View Feedback
                </Typography>
                <Box component="fieldset" mb={3} borderColor="transparent">
                    <Typography component="legend">
                        Appointment Rating:
                    </Typography>
                    <Rating
                        name="customized-icons"
                        readOnly
                        defaultValue={rating}
                        getLabelText={value => customIcons[value].label}
                        IconContainerComponent={IconContainer}
                    />
                </Box>
                <Grid lg={12} style={{ marginLeft: 18, marginTop: 30 }}>
                    <Typography>Appointment Feedback:</Typography>
                    <Typography>{props.feedback}</Typography>
                </Grid>
            </Card>
        </Container>
    );
};

export default ViewFeedback;
