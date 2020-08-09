import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

export default function notFound() {
    return (
        <Container component="main" maxWidth="xs" align="center">
            <br />
            <br />
            <br />
            <Typography component="h1" variant="h5" align="center">
                Page not found.
            </Typography>
            <br />
            <img
                height="175"
                width="175"
                src="cicscareers_logo_3.png"
                alt="cics careers"
            ></img>
        </Container>
    );
}
