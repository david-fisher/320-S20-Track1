import React from 'react';
import {Link, Typography} from '@material-ui/core';
import {withTranslation} from 'react-i18next';

function Copyright({t, i18n}) {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {t('copyright.1')}
      <Link
        color="inherit"
        href="https://www.cics.umass.edu/careers"
      >
        {t('copyright.2')}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default withTranslation('common')(Copyright);