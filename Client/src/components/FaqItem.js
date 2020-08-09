import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import PropTypes from 'prop-types';

export class FaqItem extends Component {
    getStyle() {
        return {
            background: '#ffffff',
            padding: '10px',
            borderBottom: '1px #ccc dotted',
        };
    }

    render() {
        const { question, answer } = this.props.faq;
        return (
            <div style={this.getStyle()}>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                >
                    <h2>{question}</h2>
                    <p>{answer}</p>
                </Grid>
            </div>
        );
    }
}

// PropTypes
FaqItem.propTypes = {
    faq: PropTypes.object.isRequired,
};

export default FaqItem;
