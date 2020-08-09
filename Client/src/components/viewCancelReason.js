import React from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import { Grid } from '@material-ui/core';

const ViewCancelReason = props => {
    return (
        <Container component="main">
            <Card style={{ padding: 20, margin: 30 }}>
                <Typography variant="h4" align="center">
                    View Cancel Reason
                </Typography>
                <Grid lg={12} style={{ marginLeft: 18, marginTop: 30 }}>
                    <Typography>Cancel Reason:</Typography>
                    <Typography>{props.cancel_reason}</Typography>
                </Grid>
            </Card>
        </Container>
    );
};

export default ViewCancelReason;
