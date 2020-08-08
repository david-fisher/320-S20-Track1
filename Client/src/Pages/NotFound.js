import React from "react";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { withTranslation } from 'react-i18next';

function notFound({ t, i18n }) {
  return (
    <Container component="main" maxWidth="xs" align="center">
      <br />
      <br />
      <br />
      <img height="200" width="200" src="../cicscareers_logo_3.png" alt="Reachout Logo" />
      <br />
      <br />
      <Typography component="h1" variant="h5" align="center">
        <h1>{t('page-not-found.1')}</h1>
        {t('page-not-found.2')}
      </Typography>
    </Container>
  );
}

export default withTranslation('errors')(notFound);
