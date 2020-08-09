import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Container from '@material-ui/core/Container';
import { Grid, Button, TextField } from '@material-ui/core';

function handlePress(id, reason) {
    console.log(id, reason);
    fetch(
        'https://7jdf878rej.execute-api.us-east-2.amazonaws.com/prod/appointments/cancel',
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appointment_id: id,
                cancel_reason: reason,
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

const CancelAppt = props => {
    const [cancelReason, setCancelReason] = useState('');
    return (
        <Container component="main">
            <Card style={{ padding: 20, margin: 30 }}>
                <Typography variant="h4" align="center">
                    Cancel Appointment
                </Typography>
                <Grid lg={12} style={{ marginLeft: 18, marginTop: 30 }}>
                    <Typography variant="h5">
                        {' '}
                        Are you sure you want to cancel your appointment with{' '}
                        {props.supporter}?
                    </Typography>
                    <br />
                    <Typography>
                        Please state your reason for cancellation.
                    </Typography>
                    <TextField
                        style={{ width: 1100 }}
                        id="outlined-multiline-static"
                        multiline
                        rows="6"
                        onChange={e => setCancelReason(e.target.value)}
                        variant="outlined"
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
                        onClick={() => handlePress(props.appt_id, cancelReason)}
                    >
                        Confirm Cancellation
                    </Button>
                </Grid>
            </Card>
        </Container>
    );
};

export default CancelAppt;
