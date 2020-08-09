import React from 'react';
import {
    Grid,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const FaqCard = props => {
    return (
        <ExpansionPanel>
            <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
            >
                <Grid
                    lg={12}
                    style={{ justifyContent: 'center', display: 'flex' }}
                >
                    <Typography component="h1" variant="h5">
                        {props.question}
                    </Typography>
                </Grid>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Grid
                    container
                    lg={12}
                    style={{ justifyContent: 'center', display: 'flex' }}
                >
                    <Grid
                        item
                        lg={12}
                        style={{ justifyContent: 'center', display: 'flex' }}
                    >
                        <Typography style={{ fontSize: 20 }}>
                            {props.answer}
                        </Typography>
                    </Grid>
                </Grid>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
};

export default FaqCard;
