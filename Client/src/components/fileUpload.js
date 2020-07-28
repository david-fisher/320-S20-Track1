
import React, {Component, setState, props} from 'react';
import {Button} from '@material-ui/core';

export default class fileUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {file: ""};
        this.onChangeFile = this.onChangeFile.bind(this);
    }

    render() {
        var multiple = (this.props.MultipleFile ? 'multiple' : '');

        return (
            <Button
                variant="contained"
                margin="normal"
                component="label"
                fullWidth
                align='center'
                color='secondary'
            >
            Upload a Profile Picture: &nbsp;&nbsp; {this.state.file}
            <input
                type="file"
                accept={this.props.FileType}
                fullWidth
                align='right'
                onChange={this.onChangeFile}
                style={{display: 'none'}}
                multiple
            />
            </Button>)
    }

    onChangeFile(e) {
        this.setState({
            file: [...e.target.files].map(file => file.name).join(", ")
        });

        if(this.props.onFileChange) this.props.onFileChange(e);
    }
}