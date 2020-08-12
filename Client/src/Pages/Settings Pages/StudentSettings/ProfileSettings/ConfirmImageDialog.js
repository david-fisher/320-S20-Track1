import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress} from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export default class ConfirmImageModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            picture: null,
            loading: false
        }
    }

    toggleOpen = () => {
        this.setState({ open: !this.state.open });
    }

    async handleProfileChange(file) {
        this.setState({
            open: true, // Better to let the user know that image is being processed.
            loading: true
        });

        file = await this.convertToJPEG(file);
        
        this.setState({
            loading: false,
            picture: file
        });
    }

    handleImageUpload = () => {
        this.fetchPresignedPostURL(this.state.picture);
    }

    fetchPresignedPostURL = (file) => {
        fetch('https://7jdf878rej.execute-api.us-east-2.amazonaws.com/test/users/' + sessionStorage.getItem('id') + '/picture/upload')
        .then((response) => response.json())
        .then((presignedPostData) => {
            const formData = new FormData();
            Object.keys(presignedPostData.fields).forEach((field) => {
                formData.append(field, presignedPostData.fields[field])
            })
            formData.append("file", file);
            fetch(presignedPostData.url, {
                method: 'POST',
                body: formData
            }).
            then((response) => window.location.reload(false))
        })
    }

    convertToJPEG = (file) => {
        return new Promise((resolve) => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var image = new Image();
            image.onload = (e) => {
                canvas.width = e.target.width;
                canvas.height = e.target.height;
                drawImage(e.target);
            }
            image.src = window.URL.createObjectURL(file);

            function drawImage(image) {
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                convertToJPEG();
            }

            var convertToJPEG = () => {
                canvas.toBlob((blob) => {
                    console.log(blob);
                    resolve(blob);
                }, 'image/jpeg', 1.0);
            }
        })
    }

    // saveBlobAs(blob, )

    render() {
        if (this.state.loading) {
            return (
                <div align="center">
                <br></br>
                <Typography variant="h4">Loading...</Typography>
                <br></br>
                <CircularProgress />
                </div>
            )
        }

        return (
            <Dialog
                open={this.state.open}
                onClose={this.toggleOpen}
                fullWidth
                maxWidth={'md'}
            >
                <DialogTitle onClose={this.toggleOpen}>
                    Change Profile Picture
                    <IconButton onClick={this.toggleOpen} style={{position: 'absolute', right: '0px', top: '0px' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    dividers
                    style={{ overflow: 'hidden' }}
                >
                    <center>
                        <img
                            src={this.state.picture ? window.URL.createObjectURL(this.state.picture) : ""}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh', // Didn't knew the way to do this relatively to Dialog, so used absolute values. (Dialog by default uses 80vh)
                            }}
                            // Please add styling here.
                        />
                    </center>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={this.handleImageUpload} color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}